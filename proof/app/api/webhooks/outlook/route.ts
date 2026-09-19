import { NextResponse } from 'next/server'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { safeEqual } from '@/lib/server/crypto'
import { enqueueOutlookJob, getConnectionBySubscription, markSubscriptionStatus } from '@/lib/server/database'

interface ChangeNotification {
  subscriptionId?: string
  clientState?: string
  lifecycleEvent?: string
  resource?: string
  resourceData?: { id?: string }
}

function validationResponse(request: Request) {
  const token = new URL(request.url).searchParams.get('validationToken')
  return token ? new NextResponse(token, { status: 200, headers: { 'Content-Type': 'text/plain' } }) : null
}

export async function GET(request: Request) {
  return validationResponse(request) ?? NextResponse.json({ error: 'Missing validation token.' }, { status: 400 })
}

export async function POST(request: Request) {
  const validation = validationResponse(request)
  if (validation) return validation
  const config = getOutlookRuntimeConfig()
  if (!config) return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 503 })
  const payload = await request.json() as { value?: ChangeNotification[] }
  for (const notification of payload.value ?? []) {
    if (!notification.subscriptionId || !notification.clientState || !safeEqual(notification.clientState, config.webhookClientState)) continue
    const connection = getConnectionBySubscription(notification.subscriptionId)
    if (!connection) continue
    if (notification.lifecycleEvent === 'subscriptionRemoved' || notification.lifecycleEvent === 'reauthorizationRequired') {
      markSubscriptionStatus(notification.subscriptionId, 'MISSING')
      continue
    }
    const messageId = notification.resourceData?.id ?? notification.resource?.split('/').pop()
    if (!messageId) continue
    enqueueOutlookJob({ workspaceId: connection.workspaceId, employeeId: connection.employeeId }, messageId, 'GRAPH_WEBHOOK')
  }
  return new NextResponse(null, { status: 202 })
}
