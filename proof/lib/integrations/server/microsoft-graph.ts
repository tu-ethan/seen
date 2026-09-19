import 'server-only'
import { createHash, randomBytes } from 'node:crypto'
import type { OutlookRuntimeConfig } from '@/lib/server/config'
import { decryptSecret, encryptSecret } from '@/lib/server/crypto'
import {
  getConnection,
  markConnectionError,
  saveConnection,
  saveSubscription,
  updateConnectionTokens,
  type StoredOutlookConnection,
} from '@/lib/server/database'
import type { SeenIdentity } from '@/lib/server/auth'

export const MICROSOFT_SCOPES = 'openid profile email offline_access Mail.Read'

interface TokenResponse {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  scope?: string
}

interface GraphProfile {
  id?: string
  displayName?: string
  mail?: string
  userPrincipalName?: string
}

export interface GraphMessageMetadata {
  id: string
  categories: string[]
}

interface GraphEmailAddress {
  emailAddress?: { name?: string; address?: string }
}

interface GraphMessagePayload extends GraphMessageMetadata {
  conversationId?: string
  subject?: string
  from?: GraphEmailAddress
  toRecipients?: GraphEmailAddress[]
  ccRecipients?: GraphEmailAddress[]
  sentDateTime?: string
  receivedDateTime?: string
  body?: { contentType?: string; content?: string }
}

interface GraphMessageList { value?: GraphMessageMetadata[] }

interface GraphSubscription {
  id?: string
  expirationDateTime?: string
}

export interface OAuthTokenSet {
  accessToken: string
  refreshToken: string
  expiresAt: string
  scopes: string
}

export interface OutlookMessage {
  id: string
  conversationId: string
  subject: string
  sender: string
  recipients: string[]
  timestamp: string
  categories: string[]
  body: string
  contentType: string
}

export function createPkcePair() {
  const verifier = randomBytes(48).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function authorizationUrl(config: OutlookRuntimeConfig, state: string, challenge: string) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    response_type: 'code',
    redirect_uri: config.redirectUri,
    response_mode: 'query',
    scope: MICROSOFT_SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  })
  return `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/authorize?${params}`
}

async function tokenRequest(config: OutlookRuntimeConfig, params: URLSearchParams): Promise<OAuthTokenSet> {
  params.set('client_id', config.clientId)
  params.set('client_secret', config.clientSecret)
  const response = await fetch(`https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/token`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params, cache: 'no-store',
  })
  if (!response.ok) throw new Error(`MICROSOFT_TOKEN_${response.status}`)
  const payload = await response.json() as TokenResponse
  if (!payload.access_token || !payload.refresh_token || !payload.expires_in) throw new Error('MICROSOFT_TOKEN_INVALID')
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: new Date(Date.now() + payload.expires_in * 1000).toISOString(),
    scopes: payload.scope ?? MICROSOFT_SCOPES,
  }
}

export function exchangeAuthorizationCode(config: OutlookRuntimeConfig, code: string, verifier: string) {
  return tokenRequest(config, new URLSearchParams({
    grant_type: 'authorization_code', code, redirect_uri: config.redirectUri, code_verifier: verifier, scope: MICROSOFT_SCOPES,
  }))
}

async function graphRequest<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`GRAPH_${response.status}`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export async function saveAuthorizedConnection(identity: SeenIdentity, tokenSet: OAuthTokenSet) {
  const profile = await graphRequest<GraphProfile>(tokenSet.accessToken, '/me?$select=id,displayName,mail,userPrincipalName')
  if (!profile.id) throw new Error('GRAPH_PROFILE_INVALID')
  return saveConnection({
    workspaceId: identity.workspaceId,
    employeeId: identity.employeeId,
    microsoftUserId: profile.id,
    microsoftEmail: profile.mail || profile.userPrincipalName || '',
    microsoftDisplayName: profile.displayName || profile.mail || 'Connected employee',
    encryptedAccessToken: encryptSecret(tokenSet.accessToken),
    encryptedRefreshToken: encryptSecret(tokenSet.refreshToken),
    accessTokenExpiresAt: tokenSet.expiresAt,
    scopes: tokenSet.scopes,
  })
}

export async function accessTokenFor(connection: StoredOutlookConnection, config: OutlookRuntimeConfig) {
  if (new Date(connection.accessTokenExpiresAt).getTime() > Date.now() + 5 * 60_000) return decryptSecret(connection.encryptedAccessToken)
  try {
    const tokens = await tokenRequest(config, new URLSearchParams({
      grant_type: 'refresh_token', refresh_token: decryptSecret(connection.encryptedRefreshToken), scope: MICROSOFT_SCOPES,
    }))
    updateConnectionTokens(connection.id, encryptSecret(tokens.accessToken), encryptSecret(tokens.refreshToken), tokens.expiresAt)
    return tokens.accessToken
  } catch (error) {
    markConnectionError(connection.id, 'TOKEN_REFRESH_FAILED')
    throw error
  }
}

export async function createGraphSubscription(identity: SeenIdentity, connection: StoredOutlookConnection, accessToken: string, config: OutlookRuntimeConfig) {
  const expiresAt = new Date(Date.now() + 2.5 * 24 * 60 * 60_000).toISOString()
  const subscription = await graphRequest<GraphSubscription>(accessToken, '/subscriptions', {
    method: 'POST',
    body: JSON.stringify({
      changeType: 'created,updated',
      notificationUrl: config.webhookUrl,
      lifecycleNotificationUrl: config.webhookUrl,
      resource: 'me/messages',
      expirationDateTime: expiresAt,
      clientState: config.webhookClientState,
    }),
  })
  if (!subscription.id || !subscription.expirationDateTime) throw new Error('GRAPH_SUBSCRIPTION_INVALID')
  saveSubscription(identity, connection.id, subscription.id, subscription.expirationDateTime)
  return subscription
}

export async function renewGraphSubscription(subscriptionId: string, accessToken: string) {
  const expirationDateTime = new Date(Date.now() + 2.5 * 24 * 60 * 60_000).toISOString()
  return graphRequest<GraphSubscription>(accessToken, `/subscriptions/${encodeURIComponent(subscriptionId)}`, {
    method: 'PATCH', body: JSON.stringify({ expirationDateTime }),
  })
}

export async function deleteGraphSubscription(subscriptionId: string, accessToken: string) {
  return graphRequest<void>(accessToken, `/subscriptions/${encodeURIComponent(subscriptionId)}`, { method: 'DELETE' })
}

export async function getMessageMetadata(accessToken: string, messageId: string): Promise<GraphMessageMetadata> {
  return graphRequest<GraphMessageMetadata>(accessToken, `/me/messages/${encodeURIComponent(messageId)}?$select=id,categories`)
}

const address = (recipient: GraphEmailAddress) => recipient.emailAddress?.address || recipient.emailAddress?.name || ''

export async function getOutlookMessage(accessToken: string, messageId: string): Promise<OutlookMessage> {
  const select = 'id,conversationId,subject,from,toRecipients,ccRecipients,sentDateTime,receivedDateTime,categories,body'
  const message = await graphRequest<GraphMessagePayload>(accessToken, `/me/messages/${encodeURIComponent(messageId)}?$select=${select}`)
  return {
    id: message.id,
    conversationId: message.conversationId ?? '',
    subject: message.subject || 'Untitled email',
    sender: address(message.from ?? {}),
    recipients: [...(message.toRecipients ?? []), ...(message.ccRecipients ?? [])].map(address).filter(Boolean),
    timestamp: message.sentDateTime || message.receivedDateTime || new Date(0).toISOString(),
    categories: message.categories ?? [],
    body: message.body?.content ?? '',
    contentType: message.body?.contentType ?? 'text',
  }
}

export async function listSeenMessageIds(accessToken: string, since?: string | null) {
  const filters = ["categories/any(category:category eq 'Seen')"]
  if (since) filters.push(`receivedDateTime ge ${since}`)
  const params = new URLSearchParams({
    '$select': 'id,categories', '$filter': filters.join(' and '), '$orderby': 'receivedDateTime desc', '$top': '50',
  })
  const payload = await graphRequest<GraphMessageList>(accessToken, `/me/messages?${params}`)
  return (payload.value ?? []).filter((message) => message.categories?.includes('Seen')).map((message) => message.id)
}

export function connectionFor(identity: SeenIdentity) {
  const connection = getConnection(identity)
  if (!connection) throw new Error('OUTLOOK_NOT_CONNECTED')
  return connection
}
