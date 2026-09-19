import type { ExtractedContribution } from './contracts'
import type { MeetingSeries, TranscriptTurn } from '@/types'

export const MOCK_GOOGLE_ACCOUNT = 'maya.chen@aresfrontier.example'

export const MOCK_MEETING_SERIES: MeetingSeries[] = [
  {
    id: 'calendar-series-weekly-contributions',
    title: 'Weekly Contributions',
    recurrence: 'Every Friday at 10:00 AM',
    nextMeetingAt: '2026-09-25T10:00:00-04:00',
    meetingCode: 'seen-demo-wkly',
    spaceName: 'spaces/seenWeeklyContributions',
    projectId: 'habitat-life-support',
  },
  {
    id: 'calendar-series-firmware-office-hours',
    title: 'Firmware Office Hours',
    recurrence: 'Every Tuesday at 2:00 PM',
    nextMeetingAt: '2026-09-22T14:00:00-04:00',
    meetingCode: 'seen-demo-firm',
    spaceName: 'spaces/seenFirmwareOfficeHours',
    projectId: 'sample-collection',
  },
]

export const MOCK_TRANSCRIPT_RESOURCE = 'conferenceRecords/weekly-contributions-2026-09-18/transcripts/transcript-1'
export const MOCK_EVENT_ID = 'mock-pubsub-transcript-generated-2026-09-18'
export const MOCK_MEETING_OCCURRED_AT = '2026-09-18T10:00:00-04:00'

export const MOCK_TRANSCRIPT_TURNS: TranscriptTurn[] = [
  {
    speakerId: 'maya-chen', speakerName: 'Maya Chen', startMs: 494_000, endMs: 518_000,
    text: 'The pressure spikes were lasting less than a second, so I updated the filter to ignore those while still catching a sustained drop that could mean a leak.',
  },
  {
    speakerId: 'daniel-park', speakerName: 'Daniel Park', startMs: 764_000, endMs: 783_000,
    text: 'That removed the false alarms in the chamber run without changing the sustained-leak threshold.',
  },
  {
    speakerId: 'maya-chen', speakerName: 'Maya Chen', startMs: 1_007_000, endMs: 1_033_000,
    text: 'Daniel and I reproduced the restart by switching sensors during startup. His recovery patch passed all twelve runs on the backup controller.',
  },
  {
    speakerId: 'maya-chen', speakerName: 'Maya Chen', startMs: 1_712_000, endMs: 1_749_000,
    text: 'I will run the integrated alarm test Tuesday. Electrical has the sensor harness, environmental controls will provide the leak profile, and I will own the firmware checklist.',
  },
]

export const MOCK_GEMINI_CONTRIBUTIONS: ExtractedContribution[] = [
  {
    sourceId: MOCK_TRANSCRIPT_RESOURCE,
    employee: 'Maya Chen',
    contributionType: 'IMPROVED',
    title: 'Reduced false habitat leak alarms',
    description: 'Maya adjusted pressure-sensor filtering after tests showed harmless spikes were triggering warnings.',
    exactSupportingQuote: MOCK_TRANSCRIPT_TURNS[0].text,
    speaker: 'Maya Chen',
    timestamp: '08:14',
  },
  {
    sourceId: MOCK_TRANSCRIPT_RESOURCE,
    employee: 'Maya Chen',
    contributionType: 'UNBLOCKED',
    title: 'Helped validate the backup air-quality controller',
    description: 'Maya helped Daniel reproduce an intermittent controller restart and confirmed the recovery fix.',
    exactSupportingQuote: MOCK_TRANSCRIPT_TURNS[2].text,
    speaker: 'Maya Chen',
    timestamp: '16:47',
  },
  {
    sourceId: MOCK_TRANSCRIPT_RESOURCE,
    employee: 'Maya Chen',
    contributionType: 'LED',
    title: 'Coordinated the next habitat alarm test',
    description: 'Maya aligned firmware, electrical, and environmental-control engineers on the next integrated test.',
    exactSupportingQuote: MOCK_TRANSCRIPT_TURNS[3].text,
    speaker: 'Maya Chen',
    timestamp: '28:32',
  },
]

export function createMockTranscriptEvent() {
  return {
    message: {
      messageId: MOCK_EVENT_ID,
      publishTime: '2026-09-18T14:35:00.000Z',
      data: Buffer.from(JSON.stringify({ transcript: { name: MOCK_TRANSCRIPT_RESOURCE } })).toString('base64'),
      attributes: {
        'ce-id': MOCK_EVENT_ID,
        'ce-source': '//workspaceevents.googleapis.com/subscriptions/mock-weekly-contributions',
        'ce-type': 'google.workspace.meet.transcript.v2.fileGenerated',
        'ce-time': '2026-09-18T14:35:00.000Z',
      },
    },
    subscription: 'projects/seen-demo/subscriptions/seen-transcripts',
  }
}
