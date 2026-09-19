import type { ExtractedContribution, ExtractionProvider, SourceDocument, TranscriptionProvider } from './contracts'

export async function extractEvidenceFromSources(
  documents: SourceDocument[],
  employeeName: string,
  extractionProvider: ExtractionProvider,
): Promise<ExtractedContribution[]> {
  if (!documents.length) return []
  return extractionProvider.extractContributions(documents, employeeName)
}

export async function extractEvidenceFromMeetingAudio({
  audio,
  fileName,
  meetingId,
  meetingTitle,
  occurredAt,
  employeeName,
  transcriptionProvider,
  extractionProvider,
}: {
  audio: Blob
  fileName?: string
  meetingId: string
  meetingTitle: string
  occurredAt: string
  employeeName: string
  transcriptionProvider: TranscriptionProvider
  extractionProvider: ExtractionProvider
}): Promise<ExtractedContribution[]> {
  const transcript = await transcriptionProvider.transcribeAudio(audio, fileName)
  const document: SourceDocument = {
    id: meetingId,
    provider: 'GOOGLE_MEET',
    kind: 'MEETING_TRANSCRIPT',
    title: meetingTitle,
    occurredAt,
    content: transcript.turns.map((turn) => `${turn.speakerName}: ${turn.text}`).join('\n') || transcript.text,
    transcriptTurns: transcript.turns,
  }
  return extractEvidenceFromSources([document], employeeName, extractionProvider)
}
