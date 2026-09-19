import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { listEmployeeDrafts, type OutlookDraftRecord } from '@/lib/server/database'

export async function GET(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const requested = new URL(request.url).searchParams.get('status')
  const status: OutlookDraftRecord['status'] | undefined = requested === 'DRAFT' || requested === 'APPROVED' || requested === 'DISMISSED' ? requested : undefined
  return NextResponse.json({ contributions: listEmployeeDrafts(auth.identity, status) })
}
