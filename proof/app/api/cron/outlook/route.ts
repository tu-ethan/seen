import { NextResponse } from 'next/server'
import { validCronRequest } from '@/lib/server/auth'
import { processQueuedOutlookJobs, runFallbackSyncForAllConnections } from '@/lib/integrations/server/outlook-worker'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { accessTokenFor, renewGraphSubscription } from '@/lib/integrations/server/microsoft-graph'
import { expiringSubscriptions, getConnectionBySubscription, markSubscriptionStatus, updateSubscriptionExpiry } from '@/lib/server/database'

export async function POST(request: Request) {
  if (!validCronRequest(request)) return NextResponse.json({ error: 'Invalid cron authorization.' }, { status: 401 })
  const config = getOutlookRuntimeConfig()
  if (!config) return NextResponse.json({ error: 'Outlook integration is not configured.' }, { status: 503 })
  let renewed = 0
  let renewalFailures = 0
  const before = new Date(Date.now() + 12 * 60 * 60_000).toISOString()
  for (const subscription of expiringSubscriptions(before)) {
    const id = String(subscription.id)
    const connection = getConnectionBySubscription(id)
    if (!connection) continue
    try {
      const updated = await renewGraphSubscription(id, await accessTokenFor(connection, config))
      if (!updated.expirationDateTime) throw new Error('GRAPH_SUBSCRIPTION_INVALID')
      updateSubscriptionExpiry(id, updated.expirationDateTime)
      renewed += 1
    } catch {
      markSubscriptionStatus(id, 'MISSING')
      renewalFailures += 1
    }
  }
  const queued = await runFallbackSyncForAllConnections()
  const jobs = await processQueuedOutlookJobs(50)
  return NextResponse.json({ renewed, renewalFailures, queued, ...jobs, completedAt: new Date().toISOString() })
}
