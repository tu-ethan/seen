import type { ContributionCategory, EvidenceKind, EvidenceProvider, MeetingSeries, TranscriptTurn } from '@/types'

export type IntegrationId = 'outlook' | 'google-meet'

export interface SourceDocument {
  id: string
  provider: EvidenceProvider
  kind: EvidenceKind
  title: string
  occurredAt: string
  author?: string
  content: string
  transcriptTurns?: TranscriptTurn[]
}

export interface ExtractedContribution {
  sourceId: string
  employee: string
  contributionType: ContributionCategory
  title: string
  description: string
  exactSupportingQuote: string
  speaker: string
  timestamp: string
}

export interface TranscriptResult {
  languageCode?: string
  text: string
  turns: TranscriptTurn[]
}

export interface SyncResult {
  processedSources: Array<{ id: string; provider: EvidenceProvider; title: string }>
  contributionIds: string[]
  completedAt: string
}

export interface GoogleMeetConnectionResult {
  connected: true
  accountEmail: string
  mode: 'mock' | 'live'
  availableSeries: MeetingSeries[]
}

export interface OutlookProvider {
  listRelevantMessages(): Promise<SourceDocument[]>
}

export interface GoogleMeetProvider {
  getTranscript(): Promise<SourceDocument>
}

export interface TranscriptionProvider {
  transcribeAudio(audio: Blob, fileName?: string): Promise<TranscriptResult>
}

export interface ExtractionProvider {
  extractContributions(documents: SourceDocument[], employeeName: string): Promise<ExtractedContribution[]>
}
