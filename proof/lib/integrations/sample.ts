import { MEETING_RESULT_CONTRIBUTIONS, OUTLOOK_CONTRIBUTIONS, PREPARED_TRANSCRIPT, SCHEDULED_MEETING } from '@/lib/fixtures'
import { contributionSource } from '@/lib/product'
import type { GoogleMeetProvider, OutlookProvider, SourceDocument, SyncResult } from './contracts'

export const sampleOutlookProvider: OutlookProvider = {
  async listRelevantMessages() {
    return OUTLOOK_CONTRIBUTIONS.map((contribution): SourceDocument => {
      const source = contributionSource(contribution)
      return {
        id: source.externalId,
        provider: source.provider,
        kind: source.kind,
        title: source.title,
        occurredAt: source.occurredAt,
        author: source.sender,
        content: contribution.evidence.map((item) => item.quote).join('\n'),
      }
    })
  },
}

export const sampleGoogleMeetProvider: GoogleMeetProvider = {
  async getTranscript() {
    return {
      id: SCHEDULED_MEETING.id,
      provider: 'GOOGLE_MEET',
      kind: 'MEETING_TRANSCRIPT',
      title: SCHEDULED_MEETING.title,
      occurredAt: SCHEDULED_MEETING.scheduledAt,
      content: PREPARED_TRANSCRIPT.turns.map((turn) => `${turn.speakerName}: ${turn.text}`).join('\n'),
      transcriptTurns: PREPARED_TRANSCRIPT.turns,
    }
  },
}

export async function runSampleEvidenceSync(enabledProviders: Array<'OUTLOOK' | 'GOOGLE_MEET'>): Promise<SyncResult> {
  const documents: SourceDocument[] = []
  const contributionIds: string[] = []

  if (enabledProviders.includes('OUTLOOK')) {
    documents.push(...await sampleOutlookProvider.listRelevantMessages())
    contributionIds.push(...OUTLOOK_CONTRIBUTIONS.map((item) => item.id))
  }

  if (enabledProviders.includes('GOOGLE_MEET')) {
    documents.push(await sampleGoogleMeetProvider.getTranscript())
    contributionIds.push(...MEETING_RESULT_CONTRIBUTIONS.map((item) => item.id))
  }

  return {
    processedSources: documents.map(({ id, provider, title }) => ({ id, provider, title })),
    contributionIds,
    completedAt: '2026-09-19T09:30:00-04:00',
  }
}
