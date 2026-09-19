import { NextResponse } from 'next/server'
import { processTranscriptGeneratedEvent } from '@/lib/integrations/server/google-meet-workflow'

export async function POST(request: Request) {
  const expectedToken = process.env.GOOGLE_PUBSUB_PUSH_TOKEN
  const suppliedToken = new URL(request.url).searchParams.get('token')
  if (expectedToken && suppliedToken !== expectedToken) return NextResponse.json({ error: 'Unauthorized webhook.' }, { status: 401 })

  try {
    const result = await processTranscriptGeneratedEvent(await request.json())
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Transcript event processing failed' }, { status: 400 })
  }
}
