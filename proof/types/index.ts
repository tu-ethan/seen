export type WorkspaceRole = 'employee' | 'manager'

export type ContributionCategory =
  | 'IMPROVED'
  | 'SHIPPED'
  | 'UNBLOCKED'
  | 'RESEARCHED'
  | 'MENTORED'
  | 'LED'

export type ContributionStatus =
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

export interface Contribution {
  id: string
  employeeId: string
  meetingId: string
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

export interface SkillRecord {
  name: string
  firstDemonstrated: string
  projectIds: string[]
  meetingCount: number
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
