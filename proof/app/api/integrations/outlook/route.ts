import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { integrationReadiness } from '@/lib/server/config'
import { audit, disconnectOutlook, getConnection } from '@/lib/server/database'

export async function GET(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const readiness = integrationReadiness()
  const connection = getConnection(auth.identity)
  return NextResponse.json({
    configured: readiness.configured,
    missing: readiness.missing,
    connected: Boolean(connection),
    status: connection?.status ?? 'NOT_CONNECTED',
    email: connection?.microsoftEmail ?? null,
    lastSyncedAt: connection?.lastSyncedAt ?? null,
  })
}

export async function DELETE(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const connection = getConnection(auth.identity)
  if (connection) audit(auth.identity, 'OUTLOOK_DISCONNECTED', 'outlook_connection', connection.id)
  disconnectOutlook(auth.identity)
  return NextResponse.json({ disconnected: true })
}
