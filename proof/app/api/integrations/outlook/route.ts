import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { getOutlookRuntimeConfig, integrationReadiness } from '@/lib/server/config'
import { audit, disconnectOutlook, getConnection, getSubscription } from '@/lib/server/database'
import { accessTokenFor, deleteGraphSubscription } from '@/lib/integrations/server/microsoft-graph'

export async function GET(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const readiness = integrationReadiness()
  const connection = getConnection(auth.identity)
  const subscription = connection ? getSubscription(auth.identity) : null
  return NextResponse.json({
    configured: readiness.configured,
    missing: readiness.missing,
    connected: Boolean(connection),
    status: connection?.status ?? 'NOT_CONNECTED',
    email: connection?.microsoftEmail ?? null,
    lastSyncedAt: connection?.lastSyncedAt ?? null,
    subscriptionStatus: subscription ? String(subscription.status) : null,
    subscriptionExpiresAt: subscription ? String(subscription.expires_at) : null,
  })
}

export async function DELETE(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const connection = getConnection(auth.identity)
  const subscription = connection ? getSubscription(auth.identity) : null
  const config = getOutlookRuntimeConfig()
  if (connection && subscription && config) {
    try { await deleteGraphSubscription(String(subscription.id), await accessTokenFor(connection, config)) } catch { /* local disconnect remains authoritative */ }
  }
  if (connection) audit(auth.identity, 'OUTLOOK_DISCONNECTED', 'outlook_connection', connection.id)
  disconnectOutlook(auth.identity)
  return NextResponse.json({ disconnected: true })
}
