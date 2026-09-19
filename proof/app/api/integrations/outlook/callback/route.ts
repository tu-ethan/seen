import { NextResponse } from 'next/server'
import type { SeenIdentity } from '@/lib/server/auth'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { decryptSecret, safeEqual } from '@/lib/server/crypto'
import { audit } from '@/lib/server/database'
import { createGraphSubscription, exchangeAuthorizationCode, saveAuthorizedConnection } from '@/lib/integrations/server/microsoft-graph'

interface OAuthCookie { state: string; verifier: string; identity: SeenIdentity; createdAt: number }

function readCookie(request: Request): OAuthCookie | null {
  const token = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('seen_outlook_oauth='))?.slice('seen_outlook_oauth='.length)
  if (!token) return null
  try {
    const parsed: unknown = JSON.parse(decryptSecret(token))
    if (!parsed || typeof parsed !== 'object') return null
    const value = parsed as Record<string, unknown>
    const identity = value.identity as Record<string, unknown> | undefined
    if (typeof value.state !== 'string' || typeof value.verifier !== 'string' || typeof value.createdAt !== 'number' || !identity) return null
    if (typeof identity.userId !== 'string' || typeof identity.workspaceId !== 'string' || typeof identity.employeeId !== 'string' || identity.role !== 'employee') return null
    return { state: value.state, verifier: value.verifier, createdAt: value.createdAt, identity: {
      userId: identity.userId, workspaceId: identity.workspaceId, employeeId: identity.employeeId, role: identity.role,
    } }
  } catch { return null }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const response = (value: string) => {
    const result = NextResponse.redirect(new URL(`/employee/connections?outlook=${value}`, request.url))
    result.cookies.delete('seen_outlook_oauth')
    return result
  }
  const config = getOutlookRuntimeConfig()
  const cookie = readCookie(request)
  const state = url.searchParams.get('state')
  const code = url.searchParams.get('code')
  if (!config || !cookie || !state || !code || !safeEqual(state, cookie.state) || Date.now() - cookie.createdAt > 10 * 60_000) return response('oauth-failed')
  try {
    const tokens = await exchangeAuthorizationCode(config, code, cookie.verifier)
    const connection = await saveAuthorizedConnection(cookie.identity, tokens)
    if (!connection) throw new Error('CONNECTION_SAVE_FAILED')
    try {
      await createGraphSubscription(cookie.identity, connection, tokens.accessToken, config)
      audit(cookie.identity, 'OUTLOOK_CONNECTED', 'outlook_connection', connection.id)
      return response('connected')
    } catch {
      audit(cookie.identity, 'OUTLOOK_CONNECTED_SUBSCRIPTION_PENDING', 'outlook_connection', connection.id)
      return response('connected-subscription-pending')
    }
  } catch {
    return response('oauth-failed')
  }
}
