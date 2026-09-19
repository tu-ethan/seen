import { NextResponse } from 'next/server'
import { runSampleEvidenceSync } from '@/lib/integrations/sample'

interface SampleSyncRequest {
  providers?: Array<'OUTLOOK' | 'GOOGLE_MEET'>
}

export async function POST(request: Request) {
  const body = await request.json() as SampleSyncRequest
  const providers = (body.providers ?? []).filter((provider) => provider === 'OUTLOOK' || provider === 'GOOGLE_MEET')
  if (!providers.length) return NextResponse.json({ error: 'Connect at least one source before syncing evidence.' }, { status: 400 })
  return NextResponse.json(await runSampleEvidenceSync(providers))
}
