import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { encryptSecret } from '@/lib/server/crypto'
import { authorizationUrl, createPkcePair } from '@/lib/integrations/server/microsoft-graph'

export async function GET(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const config = getOutlookRuntimeConfig()
  if (!config || !process.env.APP_ENCRYPTION_KEY) {
    return NextResponse.redirect(new URL('/employee/connections?outlook=not-configured', request.url))
  }
  const state = randomBytes(24).toString('base64url')
  const { verifier, challenge } = createPkcePair()
  const payload = encryptSecret(JSON.stringify({ state, verifier, identity: auth.identity, createdAt: Date.now() }))
  const response = NextResponse.redirect(authorizationUrl(config, state, challenge))
  response.cookies.set('seen_outlook_oauth', payload, {
    httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 10 * 60,
  })
  return response
}
