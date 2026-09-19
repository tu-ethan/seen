import 'server-only'
import { createHash } from 'node:crypto'
import { TEAM_MEMBERS } from '@/lib/fixtures'
import { createMockTranscriptEvent } from '@/lib/integrations/mock-data'
import type { ExtractedContribution } from '@/lib/integrations/contracts'
import { GeminiExtractionProvider } from '@/lib/integrations/server/gemini'
import { formatTimestamp, GoogleMeetApiClient, TRANSCRIPT_GENERATED_EVENT } from '@/lib/integrations/server/google-meet'
import { getServerState, upsertContributions } from '@/lib/integrations/server/store'
import type { Contribution, TranscriptTurn } from '@/types'

interface CloudEvent {
  id?: string
  type?: string
  time?: string
  data?: { transcript?: { name?: string } }
}

interface PubSubPushBody {
  message?: {
    data?: string
    messageId?: string
    publishTime?: string
    attributes?: Record<string, string>
  }
}

export interface TranscriptProcessingResult {
  duplicate: boolean
  eventId: string
  transcriptResourceName: string
  contributionIds: string[]
  processedAt: string
}

function parseCloudEvent(body: PubSubPushBody | CloudEvent): { event: CloudEvent; eventId: string } {
  if ('message' in body && body.message) {
    if (!body.message.data) throw new Error('Pub/Sub message is missing event data')
    let decoded: CloudEvent | CloudEvent['data']
    try {
      decoded = JSON.parse(Buffer.from(body.message.data, 'base64').toString('utf8')) as CloudEvent
    } catch {
      throw new Error('Pub/Sub message contains invalid base64-encoded JSON')
    }
    const attributes = body.message.attributes ?? {}
    const event = 'type' in decoded ? decoded as CloudEvent : {
      id: attributes['ce-id'] ?? body.message.messageId,
      type: attributes['ce-type'],
      time: attributes['ce-time'] ?? body.message.publishTime,
      data: decoded as CloudEvent['data'],
    }
    return { event, eventId: body.message.messageId ?? event.id ?? 'unknown-event' }
  }
  const event = body as CloudEvent
  return { event, eventId: event.id ?? 'unknown-event' }
}

function stableContributionId(sourceId: string, extracted: ExtractedContribution, index: number) {
  const digest = createHash('sha256')
    .update(`${sourceId}|${extracted.employee}|${extracted.title}|${extracted.exactSupportingQuote}|${index}`)
    .digest('hex')
    .slice(0, 12)
  return `meet-${digest}`
}

function groundedTurn(extracted: ExtractedContribution, turns: TranscriptTurn[]) {
  return turns.find((turn) => turn.speakerName === extracted.speaker
    && turn.text.includes(extracted.exactSupportingQuote)
    && formatTimestamp(turn.startMs) === extracted.timestamp)
}

function toContribution(
  extracted: ExtractedContribution,
  index: number,
  source: Awaited<ReturnType<GoogleMeetApiClient['fetchTranscript']>>,
  projectId: string,
): Contribution | null {
  const employee = TEAM_MEMBERS.find((item) => item.name.toLocaleLowerCase() === extracted.employee.toLocaleLowerCase())
  const turn = groundedTurn(extracted, source.transcriptTurns ?? [])
  if (!employee || !turn) return null

  return {
    id: stableContributionId(source.id, extracted, index),
    employeeId: employee.id,
    meetingId: source.id.split('/transcripts/')[0],
    projectId,
    category: extracted.contributionType,
    title: extracted.title.trim(),
    description: extracted.description.trim(),
    date: source.occurredAt.slice(0, 10),
    skills: [],
    status: 'AI_CAPTURED',
    evidence: [{ quote: extracted.exactSupportingQuote, speaker: turn.speakerName, timestamp: formatTimestamp(turn.startMs) }],
    source: {
      provider: 'GOOGLE_MEET',
      kind: 'MEETING_TRANSCRIPT',
      title: source.title,
      occurredAt: source.occurredAt,
      externalId: source.id,
    },
    sharedWithManager: true,
  }
}

export async function processTranscriptGeneratedEvent(
  body: PubSubPushBody | CloudEvent,
  meetClient = new GoogleMeetApiClient(),
  gemini = new GeminiExtractionProvider(),
): Promise<TranscriptProcessingResult> {
  const { event, eventId } = parseCloudEvent(body)
  if (event.type !== TRANSCRIPT_GENERATED_EVENT) throw new Error(`Unsupported Google Workspace event type: ${event.type ?? 'missing'}`)
  const transcriptResourceName = event.data?.transcript?.name
  if (!transcriptResourceName) throw new Error('Transcript-generated event is missing the transcript resource name')

  const state = getServerState()
  const dedupeKey = `${eventId}:${transcriptResourceName}`
  if (state.processedEventIds.includes(dedupeKey)) {
    const existing = state.contributions.filter((item) => item.source?.externalId === transcriptResourceName).map((item) => item.id)
    return { duplicate: true, eventId, transcriptResourceName, contributionIds: existing, processedAt: state.googleMeet.lastEventAt ?? new Date().toISOString() }
  }
  if (!state.googleMeet.selectedSeries || !state.googleMeet.subscription) throw new Error('No Google Meet series is subscribed')

  try {
    const source = await meetClient.fetchTranscript(transcriptResourceName, state.googleMeet.selectedSeries.title)
    const extracted = await gemini.extractContributions([source], TEAM_MEMBERS.map((employee) => employee.name).join(', '))
    const contributions = extracted
      .map((item, index) => toContribution(item, index, source, state.googleMeet.selectedSeries!.projectId))
      .filter((item): item is Contribution => item !== null)

    if (extracted.length && contributions.length !== extracted.length) {
      throw new Error('Gemini returned evidence that was not an exact speaker-and-timestamp match in the transcript')
    }

    upsertContributions(contributions)
    state.processedEventIds.push(dedupeKey)
    state.googleMeet.lastEventAt = event.time ?? new Date().toISOString()
    state.googleMeet.lastError = undefined
    return {
      duplicate: false,
      eventId,
      transcriptResourceName,
      contributionIds: contributions.map((item) => item.id),
      processedAt: state.googleMeet.lastEventAt,
    }
  } catch (error) {
    state.googleMeet.lastError = error instanceof Error ? error.message : 'Transcript processing failed'
    throw error
  }
}

export async function simulateTranscriptGeneratedEvent() {
  const state = getServerState()
  if (state.googleMeet.mode !== 'mock') throw new Error('Transcript simulation is only available in mock mode')
  return processTranscriptGeneratedEvent(createMockTranscriptEvent())
}
