import { MEETING_RESULT_CONTRIBUTIONS, PREPARED_TRANSCRIPT, SCHEDULED_MEETING } from '@/lib/fixtures'
import type { Contribution, Meeting, SpeakerAwareTranscript } from '@/types'

export interface CalendarProvider { getScheduledMeetings(): Promise<Meeting[]> }
export interface TranscriptionProvider { transcribe(meetingId: string): Promise<SpeakerAwareTranscript> }
export interface ExtractionProvider { extract(transcript: SpeakerAwareTranscript, employeeId: string): Promise<Contribution[]> }

export const sampleCalendarProvider: CalendarProvider = {
  async getScheduledMeetings() { return [SCHEDULED_MEETING] },
}

export const preparedTranscriptionProvider: TranscriptionProvider = {
  async transcribe() { return PREPARED_TRANSCRIPT },
}

export const deterministicExtractionProvider: ExtractionProvider = {
  async extract(_transcript, employeeId) {
    return MEETING_RESULT_CONTRIBUTIONS.map((contribution) => ({ ...contribution, employeeId }))
  },
}
