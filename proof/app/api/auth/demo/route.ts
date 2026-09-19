import { NextResponse } from 'next/server'
import { isDemoMode } from '@/lib/server/config'
import { setDemoSession } from '@/lib/server/auth'

export async function GET(request: Request) {
  if (!isDemoMode()) return NextResponse.json({ error: 'Demo sign-in is disabled.' }, { status: 404 })
  return setDemoSession(NextResponse.redirect(new URL('/employee', request.url)))
}
