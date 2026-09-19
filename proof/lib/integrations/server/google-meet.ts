import 'server-only'
import { MOCK_GOOGLE_ACCOUNT, MOCK_MEETING_OCCURRED_AT, MOCK_MEETING_SERIES, MOCK_TRANSCRIPT_TURNS } from '@/lib/integrations/mock-data'
import type { SourceDocument } from '@/lib/integrations/contracts'
import type { GoogleMeetSubscription, MeetingSeries, TranscriptTurn } from '@/types'

type Fetcher = typeof fetch

interface CalendarEvent {
  id?: string
  summary?: string
  recurrence?: string[]
  start?: { dateTime?: string; date?: string }
  hangoutLink?: string
  conferenceData?: { conferenceId?: string }
}

interface CalendarEventsResponse { items?: CalendarEvent[] }
interface MeetSpaceResponse { name?: string; meetingCode?: string }
interface MeetTranscriptEntry { name?: string; participant?: string; text?: string; startTime?: string; endTime?: string }
interface MeetTranscriptEntriesResponse { transcriptEntries?: MeetTranscriptEntry[]; nextPageToken?: string }
interface MeetParticipant {
  name?: string
  signedinUser?: { displayName?: string }
  anonymousUser?: { displayName?: string }
  phoneUser?: { displayName?: string }
}
interface MeetParticipantsResponse { participants?: MeetParticipant[]; nextPageToken?: string }
interface MeetTranscriptResponse { startTime?: string }
interface WorkspaceSubscriptionResponse {
  name?: string
  targetResource?: string
  eventTypes?: string[]
  expireTime?: string
  state?: string
}
interface GoogleOperation { name?: string; done?: boolean; error?: { message?: string }; response?: WorkspaceSubscriptionResponse }

const GOOGLE_MEET_EVENT = 'google.workspace.meet.transcript.v2.fileGenerated' as const

function assertOk(response: Response, operation: string) {
  if (!response.ok) throw new Error(`${operation} failed with status ${response.status}`)
}

function meetingCode(event: CalendarEvent) {
  return event.conferenceData?.conferenceId ?? event.hangoutLink?.match(/meet\.google\.com\/([a-z-]+)/i)?.[1]
}

function recurrenceLabel(rules: string[] | undefined) {
  const rule = rules?.find((item) => item.startsWith('RRULE:'))
  if (!rule) return 'Recurring meeting'
  if (rule.includes('FREQ=WEEKLY')) return 'Weekly recurring meeting'
  if (rule.includes('FREQ=DAILY')) return 'Daily recurring meeting'
  if (rule.includes('FREQ=MONTHLY')) return 'Monthly recurring meeting'
  return 'Recurring meeting'
}

function displayName(participant: MeetParticipant) {
  return participant.signedinUser?.displayName ?? participant.anonymousUser?.displayName ?? participant.phoneUser?.displayName ?? 'Participant'
}

function toRelativeMs(value: string | undefined, originMs: number) {
  if (!value) return 0
  return Math.max(0, new Date(value).getTime() - originMs)
}

export class GoogleMeetApiClient {
  private readonly mock: boolean

  constructor(
    private readonly accessToken = process.env.GOOGLE_MEET_ACCESS_TOKEN,
    private readonly pubsubTopic = process.env.GOOGLE_PUBSUB_TOPIC,
    private readonly fetcher: Fetcher = fetch,
  ) {
    this.mock = !accessToken || accessToken.startsWith('mock-')
  }

  get mode(): 'mock' | 'live' { return this.mock ? 'mock' : 'live' }

  async connect(): Promise<{ accountEmail: string; series: MeetingSeries[] }> {
    if (this.mock) return { accountEmail: MOCK_GOOGLE_ACCOUNT, series: structuredClone(MOCK_MEETING_SERIES) }
    if (!this.accessToken) throw new Error('GOOGLE_MEET_ACCESS_TOKEN is required')

    const profileResponse = await this.fetcher('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${this.accessToken}` }, cache: 'no-store',
    })
    assertOk(profileResponse, 'Google account lookup')
    const profile = await profileResponse.json() as { email?: string }

    const calendarUrl = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events')
    calendarUrl.searchParams.set('singleEvents', 'false')
    calendarUrl.searchParams.set('showDeleted', 'false')
    calendarUrl.searchParams.set('maxResults', '100')
    const calendarResponse = await this.fetcher(calendarUrl, {
      headers: { Authorization: `Bearer ${this.accessToken}` }, cache: 'no-store',
    })
    assertOk(calendarResponse, 'Google Calendar recurring meeting lookup')
    const calendar = await calendarResponse.json() as CalendarEventsResponse

    const recurringMeetEvents = (calendar.items ?? []).filter((event) => event.recurrence?.length && meetingCode(event))
    const series = (await Promise.all(recurringMeetEvents.map(async (event): Promise<MeetingSeries | null> => {
      const code = meetingCode(event)
      if (!event.id || !code) return null
      const spaceResponse = await this.fetcher(`https://meet.googleapis.com/v2/spaces/${encodeURIComponent(code)}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }, cache: 'no-store',
      })
      assertOk(spaceResponse, `Google Meet space lookup for ${event.summary ?? event.id}`)
      const space = await spaceResponse.json() as MeetSpaceResponse
      if (!space.name) return null
      return {
        id: event.id,
        title: event.summary ?? 'Recurring Google Meet',
        recurrence: recurrenceLabel(event.recurrence),
        nextMeetingAt: event.start?.dateTime ?? event.start?.date ?? new Date().toISOString(),
        meetingCode: space.meetingCode ?? code,
        spaceName: space.name,
        projectId: process.env.GOOGLE_MEET_DEFAULT_PROJECT_ID ?? 'habitat-life-support',
      }
    }))).filter((item): item is MeetingSeries => item !== null)

    return { accountEmail: profile.email ?? 'Connected Google account', series }
  }

  async createTranscriptSubscription(spaceName: string): Promise<GoogleMeetSubscription> {
    if (this.mock) {
      return {
        name: 'subscriptions/mock-weekly-contributions',
        targetResource: `//meet.googleapis.com/${spaceName}`,
        eventType: GOOGLE_MEET_EVENT,
        expiresAt: '2026-09-26T14:00:00.000Z',
        state: 'ACTIVE',
      }
    }
    if (!this.accessToken) throw new Error('GOOGLE_MEET_ACCESS_TOKEN is required')
    if (!this.pubsubTopic) throw new Error('GOOGLE_PUBSUB_TOPIC is required to create a Google Workspace Events subscription')

    const response = await this.fetcher('https://workspaceevents.googleapis.com/v1/subscriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetResource: `//meet.googleapis.com/${spaceName}`,
        eventTypes: [GOOGLE_MEET_EVENT],
        notificationEndpoint: { pubsubTopic: this.pubsubTopic },
        payloadOptions: { includeResource: false },
        ttl: '604800s',
      }),
      cache: 'no-store',
    })
    assertOk(response, 'Google Workspace subscription creation')
    let operation = await response.json() as GoogleOperation
    for (let attempt = 0; !operation.done && operation.name && attempt < 8; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 250))
      const poll = await this.fetcher(`https://workspaceevents.googleapis.com/v1/${operation.name}`, {
        headers: { Authorization: `Bearer ${this.accessToken}` }, cache: 'no-store',
      })
      assertOk(poll, 'Google Workspace subscription operation')
      operation = await poll.json() as GoogleOperation
    }
    if (operation.error) throw new Error(operation.error.message ?? 'Google Workspace subscription creation failed')
    if (!operation.response?.name || !operation.response.targetResource || !operation.response.expireTime) {
      throw new Error('Google Workspace subscription creation did not complete')
    }
    return {
      name: operation.response.name,
      targetResource: operation.response.targetResource,
      eventType: GOOGLE_MEET_EVENT,
      expiresAt: operation.response.expireTime,
      state: 'ACTIVE',
    }
  }

  async fetchTranscript(transcriptResourceName: string, meetingTitle: string): Promise<SourceDocument> {
    if (this.mock) {
      return {
        id: transcriptResourceName,
        provider: 'GOOGLE_MEET',
        kind: 'MEETING_TRANSCRIPT',
        title: meetingTitle,
        occurredAt: MOCK_MEETING_OCCURRED_AT,
        content: MOCK_TRANSCRIPT_TURNS.map((turn) => `${turn.speakerName} [${formatTimestamp(turn.startMs)}]: ${turn.text}`).join('\n'),
        transcriptTurns: structuredClone(MOCK_TRANSCRIPT_TURNS),
      }
    }
    if (!this.accessToken) throw new Error('GOOGLE_MEET_ACCESS_TOKEN is required')
    if (!/^conferenceRecords\/[^/]+\/transcripts\/[^/]+$/.test(transcriptResourceName)) throw new Error('Invalid Google Meet transcript resource name')

    const headers = { Authorization: `Bearer ${this.accessToken}` }
    const transcriptResponse = await this.fetcher(`https://meet.googleapis.com/v2/${transcriptResourceName}`, { headers, cache: 'no-store' })
    assertOk(transcriptResponse, 'Google Meet transcript lookup')
    const transcript = await transcriptResponse.json() as MeetTranscriptResponse

    const conferenceRecord = transcriptResourceName.split('/transcripts/')[0]
    const participants: MeetParticipant[] = []
    let participantToken = ''
    do {
      const url = new URL(`https://meet.googleapis.com/v2/${conferenceRecord}/participants`)
      url.searchParams.set('pageSize', '250')
      if (participantToken) url.searchParams.set('pageToken', participantToken)
      const response = await this.fetcher(url, { headers, cache: 'no-store' })
      assertOk(response, 'Google Meet participant lookup')
      const payload = await response.json() as MeetParticipantsResponse
      participants.push(...(payload.participants ?? []))
      participantToken = payload.nextPageToken ?? ''
    } while (participantToken)

    const entries: MeetTranscriptEntry[] = []
    let entryToken = ''
    do {
      const url = new URL(`https://meet.googleapis.com/v2/${transcriptResourceName}/entries`)
      url.searchParams.set('pageSize', '100')
      if (entryToken) url.searchParams.set('pageToken', entryToken)
      const response = await this.fetcher(url, { headers, cache: 'no-store' })
      assertOk(response, 'Google Meet transcript entry lookup')
      const payload = await response.json() as MeetTranscriptEntriesResponse
      entries.push(...(payload.transcriptEntries ?? []))
      entryToken = payload.nextPageToken ?? ''
    } while (entryToken)

    const names = new Map(participants.map((participant) => [participant.name, displayName(participant)]))
    const fallbackOrigin = entries[0]?.startTime ? new Date(entries[0].startTime).getTime() : Date.now()
    const originMs = transcript.startTime ? new Date(transcript.startTime).getTime() : fallbackOrigin
    const turns: TranscriptTurn[] = entries.map((entry) => ({
      speakerId: entry.participant ?? entry.name ?? 'participant',
      speakerName: names.get(entry.participant) ?? 'Participant',
      startMs: toRelativeMs(entry.startTime, originMs),
      endMs: toRelativeMs(entry.endTime, originMs),
      text: entry.text ?? '',
    })).filter((turn) => turn.text.trim())

    return {
      id: transcriptResourceName,
      provider: 'GOOGLE_MEET',
      kind: 'MEETING_TRANSCRIPT',
      title: meetingTitle,
      occurredAt: transcript.startTime ?? entries[0]?.startTime ?? new Date().toISOString(),
      content: turns.map((turn) => `${turn.speakerName} [${formatTimestamp(turn.startMs)}]: ${turn.text}`).join('\n'),
      transcriptTurns: turns,
    }
  }
}

export function formatTimestamp(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export const TRANSCRIPT_GENERATED_EVENT = GOOGLE_MEET_EVENT
