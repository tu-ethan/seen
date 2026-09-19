import { NextResponse } from 'next/server'
import { GoogleMeetApiClient } from '@/lib/integrations/server/google-meet'
import { getServerState } from '@/lib/integrations/server/store'

export async function POST() {
  try {
    const client = new GoogleMeetApiClient()
    const connection = await client.connect()
    const state = getServerState()
    state.googleMeet = {
      connected: true,
      accountEmail: connection.accountEmail,
      mode: client.mode,
      availableSeries: connection.series,
    }
    return NextResponse.json(state.googleMeet)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Google connection failed' }, { status: 502 })
  }
}

export async function DELETE() {
  const state = getServerState()
  state.googleMeet = { connected: false, mode: state.googleMeet.mode, availableSeries: [] }
  return new NextResponse(null, { status: 204 })
}
