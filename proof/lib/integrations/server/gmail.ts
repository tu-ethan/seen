import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import type { GmailRuntimeConfig } from '@/lib/server/config'
import { decryptSecret, encryptSecret } from '@/lib/server/crypto'
import {
  getConnection,
  markConnectionError,
  saveConnection,
  updateConnectionTokens,
  type StoredGmailConnection,
} from '@/lib/server/database'
import type { SeenIdentity } from '@/lib/server/auth'
import { parseGmailMessage, type GmailMessagePayload } from '@/lib/integrations/gmail-message'

export type { GmailMessage } from '@/lib/integrations/gmail-message'

export const GMAIL_SCOPES = 'openid profile email https://www.googleapis.com/auth/gmail.readonly'
export const SEEN_GMAIL_LABEL = 'Seen'

interface TokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

interface GoogleProfile {
  sub?: string
  email?: string
  name?: string
}

interface GmailLabel {
  id?: string
  name?: string
}

interface GmailLabelList {
  labels?: GmailLabel[]
}

interface GmailMessageList {
  messages?: Array<{ id?: string }>
  nextPageToken?: string
}

export interface OAuthTokenSet {
  accessToken: string
  refreshToken?: string
  expiresAt: string
  scopes: string
}

export function createPkcePair() {
  const verifier = randomBytes(48).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function authorizationUrl(config: GmailRuntimeConfig, state: string, challenge: string) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: GMAIL_SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    include_granted_scopes: 'true',
    prompt: 'consent select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

async function tokenRequest(config: GmailRuntimeConfig, params: URLSearchParams): Promise<OAuthTokenSet> {
  params.set('client_id', config.clientId)
  params.set('client_secret', config.clientSecret)
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`GOOGLE_TOKEN_${response.status}`)
  const payload = await response.json() as TokenResponse
  if (!payload.access_token || !payload.expires_in) throw new Error('GOOGLE_TOKEN_INVALID')
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: new Date(Date.now() + payload.expires_in * 1000).toISOString(),
    scopes: payload.scope ?? GMAIL_SCOPES,
  }
}

export async function exchangeAuthorizationCode(config: GmailRuntimeConfig, code: string, verifier: string) {
  const tokens = await tokenRequest(config, new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    code_verifier: verifier,
  }))
  if (!tokens.refreshToken) throw new Error('GOOGLE_REFRESH_TOKEN_MISSING')
  return tokens
}

async function googleRequest<T>(accessToken: string, url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`GMAIL_${response.status}`)
  return response.json() as Promise<T>
}

export async function saveAuthorizedConnection(identity: SeenIdentity, tokenSet: OAuthTokenSet) {
  if (!tokenSet.refreshToken) throw new Error('GOOGLE_REFRESH_TOKEN_MISSING')
  const profile = await googleRequest<GoogleProfile>(tokenSet.accessToken, 'https://openidconnect.googleapis.com/v1/userinfo')
  if (!profile.sub || !profile.email) throw new Error('GOOGLE_PROFILE_INVALID')
  return saveConnection({
    workspaceId: identity.workspaceId,
    employeeId: identity.employeeId,
    googleUserId: profile.sub,
    gmailEmail: profile.email,
    gmailDisplayName: profile.name || profile.email,
    encryptedAccessToken: encryptSecret(tokenSet.accessToken),
    encryptedRefreshToken: encryptSecret(tokenSet.refreshToken),
    accessTokenExpiresAt: tokenSet.expiresAt,
    scopes: tokenSet.scopes,
  })
}

export async function accessTokenFor(connection: StoredGmailConnection, config: GmailRuntimeConfig) {
  if (new Date(connection.accessTokenExpiresAt).getTime() > Date.now() + 5 * 60_000) {
    return decryptSecret(connection.encryptedAccessToken)
  }
  try {
    const tokens = await tokenRequest(config, new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: decryptSecret(connection.encryptedRefreshToken),
    }))
    updateConnectionTokens(
      connection.id,
      encryptSecret(tokens.accessToken),
      tokens.refreshToken ? encryptSecret(tokens.refreshToken) : connection.encryptedRefreshToken,
      tokens.expiresAt,
    )
    return tokens.accessToken
  } catch (error) {
    markConnectionError(connection.id, 'TOKEN_REFRESH_FAILED')
    throw error
  }
}

async function seenLabelId(accessToken: string) {
  const fields = encodeURIComponent('labels(id,name)')
  const payload = await googleRequest<GmailLabelList>(accessToken, `https://gmail.googleapis.com/gmail/v1/users/me/labels?fields=${fields}`)
  return payload.labels?.find((label) => label.name === SEEN_GMAIL_LABEL)?.id ?? null
}

export async function listSeenMessageIds(accessToken: string) {
  const labelId = await seenLabelId(accessToken)
  if (!labelId) return { labelId: null, messageIds: [] as string[] }
  const messageIds: string[] = []
  let pageToken: string | undefined
  do {
    const params = new URLSearchParams({ labelIds: labelId, maxResults: '500', fields: 'messages(id),nextPageToken' })
    if (pageToken) params.set('pageToken', pageToken)
    const payload = await googleRequest<GmailMessageList>(accessToken, `https://gmail.googleapis.com/gmail/v1/users/me/messages?${params}`)
    messageIds.push(...(payload.messages ?? []).flatMap((message) => message.id ? [message.id] : []))
    pageToken = payload.nextPageToken
  } while (pageToken)
  return { labelId, messageIds }
}

export async function getGmailMessage(accessToken: string, messageId: string, seenLabelId: string) {
  const fields = encodeURIComponent('id,labelIds,internalDate,payload(headers,mimeType,filename,body(data,attachmentId),parts)')
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full&fields=${fields}`
  const message = await googleRequest<GmailMessagePayload>(accessToken, url)
  return parseGmailMessage(message, seenLabelId, SEEN_GMAIL_LABEL)
}

export function connectionFor(identity: SeenIdentity) {
  const connection = getConnection(identity)
  if (!connection) throw new Error('OUTLOOK_NOT_CONNECTED')
  return connection
}
