import { NextResponse } from 'next/server'
import { simulateTranscriptGeneratedEvent } from '@/lib/integrations/server/google-meet-workflow'

export async function POST() {
  try {
    return NextResponse.json(await simulateTranscriptGeneratedEvent())
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Transcript simulation failed' }, { status: 400 })
  }
}
