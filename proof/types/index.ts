export type WorkspaceRole = 'employee' | 'manager'

export type ContributionCategory =
  | 'IMPROVED'
  | 'SHIPPED'
  | 'UNBLOCKED'
  | 'RESEARCHED'
  | 'MENTORED'
  | 'LED'

export type ContributionStatus =
  | 'DRAFT'
  | 'APPROVED'
  | 'AI_CAPTURED'
  | 'NEEDS_REVIEW'
  | 'VERIFIED'
  | 'EDITED'
  | 'DISMISSED'

export interface Person {
  id: string
  name: string
  initials: string
  title: string
}

export interface EmployeeProfile extends Person {
  managerId: string
  projectIds: string[]
  location: string
  summary: string
  reviewSummary: string
  accent: 'lilac' | 'rust' | 'blue' | 'sand' | 'green'
}

export interface Project {
  id: string
  name: string
  shortName: string
  purpose: string
  mayaRole: string
  status: 'Active' | 'Planning' | 'Field testing'
  latestProgress: string
  accent: 'rust' | 'lilac' | 'sand' | 'blue' | 'green'
}

export type MeetingParticipant = Person

export interface Meeting {
  id: string
  title: string
  projectId: string
  platform: 'Google Meet'
  scheduledAt: string
  displayTime: string
  participants: MeetingParticipant[]
  recurring: boolean
  captureEnabled: boolean
}

export interface ContributionEvidence {
  quote: string
  timestamp: string
  speaker: string
}

export type EvidenceProvider = 'GOOGLE_MEET' | 'OUTLOOK'
export type EvidenceKind = 'MEETING_TRANSCRIPT' | 'EMAIL'

export interface EvidenceSource {
  provider: EvidenceProvider
  kind: EvidenceKind
  title: string
  occurredAt: string
  externalId: string
  sender?: string
}

export interface Contribution {
  id: string
  employeeId: string
  meetingId?: string
  source?: EvidenceSource
  projectId: string
  category: ContributionCategory
  title: string
  description: string
  date: string
  skills: string[]
  status: ContributionStatus
  evidence: ContributionEvidence[]
  sharedWithManager: boolean
}

export interface WorkspaceState {
  contributions: Contribution[]
}

export interface MeetingSeries {
  id: string
  title: string
  recurrence: string
  nextMeetingAt: string
  meetingCode: string
  spaceName: string
  projectId: string
}

export interface GoogleMeetSubscription {
  name: string
  targetResource: string
  eventType: 'google.workspace.meet.transcript.v2.fileGenerated'
  expiresAt: string
  state: 'ACTIVE'
}

export interface GoogleMeetConnection {
  connected: boolean
  accountEmail?: string
  mode: 'mock' | 'live'
  availableSeries: MeetingSeries[]
  selectedSeries?: MeetingSeries
  subscription?: GoogleMeetSubscription
  lastEventAt?: string
  lastError?: string
}

export interface SkillRecord {
  name: string
  firstDemonstrated: string
  projectIds: string[]
  sourceCount: number
  examples: Contribution[]
  narrative: string
}

export interface TranscriptTurn {
  speakerId: string
  speakerName: string
  startMs: number
  endMs: number
  text: string
}

export interface SpeakerAwareTranscript {
  meetingId: string
  turns: TranscriptTurn[]
}
