import 'server-only'
import { createHmac } from 'node:crypto'
import { NextResponse } from 'next/server'
import { isDemoMode } from './config'
import { safeEqual } from './crypto'

export interface SeenIdentity {
  userId: string
  workspaceId: string
  employeeId: string
  role: 'employee' | 'manager'
}

const DEMO_EMPLOYEE: SeenIdentity = {
  userId: 'demo-maya',
  workspaceId: 'ares-frontier',
  employeeId: 'maya-chen',
  role: 'employee',
}

function sessionSecret() {
  return process.env.SEEN_SESSION_SECRET?.trim() ?? ''
}

function sign(payload: string) {
  const secret = sessionSecret()
  if (!secret) throw new Error('SEEN_SESSION_SECRET is not configured')
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function encodeSession(identity: SeenIdentity) {
  const payload = Buffer.from(JSON.stringify(identity)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

function decodeSession(token: string): SeenIdentity | null {
  const [payload, signature] = token.split('.')
  if (!payload || !signature || !sessionSecret()) return null
  if (!safeEqual(signature, sign(payload))) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!parsed || typeof parsed !== 'object') return null
    const item = parsed as Record<string, unknown>
    if (typeof item.userId !== 'string' || typeof item.workspaceId !== 'string' || typeof item.employeeId !== 'string') return null
    if (item.role !== 'employee' && item.role !== 'manager') return null
    return { userId: item.userId, workspaceId: item.workspaceId, employeeId: item.employeeId, role: item.role }
  } catch {
    return null
  }
}

export function currentIdentity(request: Request): SeenIdentity | null {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim()).find((part) => part.startsWith('seen_session='))
  const token = cookie?.slice('seen_session='.length)
  if (token) return decodeSession(token)
  return isDemoMode() ? DEMO_EMPLOYEE : null
}

export function requireIdentity(request: Request, role?: SeenIdentity['role']) {
  const identity = currentIdentity(request)
  if (!identity) return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) }
  if (role && identity.role !== role) return { response: NextResponse.json({ error: 'You do not have access to this resource.' }, { status: 403 }) }
  return { identity }
}

export function ownsResource(identity: SeenIdentity, workspaceId: string, employeeId: string) {
  return identity.workspaceId === workspaceId && identity.employeeId === employeeId
}

export function canManagerView(status: string, rawBodyIncluded: boolean) {
  return status === 'APPROVED' && !rawBodyIncluded
}

export function setDemoSession(response: NextResponse) {
  if (sessionSecret()) {
    response.cookies.set('seen_session', encodeSession(DEMO_EMPLOYEE), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
  }
  return response
}
