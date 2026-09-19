import { NextResponse } from 'next/server'
import { GoogleMeetApiClient } from '@/lib/integrations/server/google-meet'
import { getServerState } from '@/lib/integrations/server/store'

export async function POST(request: Request) {
  const body = await request.json() as { seriesId?: string }
  const state = getServerState()
  if (!state.googleMeet.connected) return NextResponse.json({ error: 'Connect Google before selecting a meeting series.' }, { status: 409 })
  const series = state.googleMeet.availableSeries.find((item) => item.id === body.seriesId)
  if (!series) return NextResponse.json({ error: 'Choose a valid recurring meeting series.' }, { status: 400 })

  try {
    const subscription = await new GoogleMeetApiClient().createTranscriptSubscription(series.spaceName)
    state.googleMeet.selectedSeries = series
    state.googleMeet.subscription = subscription
    return NextResponse.json(state.googleMeet)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Subscription creation failed' }, { status: 502 })
  }
}
