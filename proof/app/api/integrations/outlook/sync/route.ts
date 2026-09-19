import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { processQueuedOutlookJobs, queueFallbackSync } from '@/lib/integrations/server/outlook-worker'

export async function POST(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  try {
    const queued = await queueFallbackSync(auth.identity)
    const result = await processQueuedOutlookJobs(25)
    return NextResponse.json({ queued, ...result, completedAt: new Date().toISOString() })
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SYNC_FAILED'
    const status = code === 'OUTLOOK_NOT_CONNECTED' ? 409 : code === 'OUTLOOK_NOT_CONFIGURED' ? 503 : 502
    return NextResponse.json({ error: code }, { status })
  }
}
