// ─── Enums ────────────────────────────────────────────────────
export type ProfileRole = 'EMPLOYEE' | 'MANAGER'
export type MeetingStatus = 'RECORDING' | 'PROCESSING' | 'COMPLETE' | 'FAILED'
export type ContributionType =
  | 'EXECUTION'
  | 'OWNERSHIP'
  | 'IDEATION'
  | 'RESEARCH'
  | 'COLLABORATION'
  | 'LEADERSHIP'
export type ContributionStatus = 'AI_EXTRACTED' | 'VERIFIED' | 'DISMISSED'
export type CommitmentStatus = 'OPEN' | 'COMPLETE' | 'CANCELLED'
export type ProjectStatus = 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'ARCHIVED'

// ─── Database row types ───────────────────────────────────────
export interface Profile {
  id: string
  auth_user_id: string
  name: string
  email: string
  role: ProfileRole
  job_title: string | null
  manager_id: string | null
  avatar_url: string | null
  created_at: string
}

export interface Team {
  id: string
  name: string
  manager_id: string
  created_at: string
}

export interface TeamMember {
  id: string
  team_id: string
  profile_id: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: ProjectStatus
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  id: string
  project_id: string
  profile_id: string
  role: string | null
}

export interface Meeting {
  id: string
  title: string
  project_id: string | null
  started_at: string | null
  ended_at: string | null
  created_by: string
  status: MeetingStatus
  audio_url: string | null
  created_at: string
}

export interface MeetingParticipant {
  id: string
  meeting_id: string
  profile_id: string
  speaker_label: string | null
}

export interface TranscriptSegment {
  id: string
  meeting_id: string
  profile_id: string | null
  speaker_label: string | null
  text: string
  start_ms: number | null
  end_ms: number | null
  created_at: string
}

export interface Contribution {
  id: string
  profile_id: string
  meeting_id: string | null
  project_id: string | null
  type: ContributionType
  title: string
  description: string
  occurred_at: string
  confidence: number
  status: ContributionStatus
  created_at: string
}

export interface ContributionEvidence {
  id: string
  contribution_id: string
  transcript_segment_id: string | null
  evidence_text: string
  created_at: string
}

export interface Skill {
  id: string
  name: string
}

export interface EmployeeSkill {
  id: string
  profile_id: string
  skill_id: string
  contribution_id: string | null
  confidence: number
  created_at: string
}

export interface Commitment {
  id: string
  profile_id: string
  meeting_id: string | null
  project_id: string | null
  description: string
  status: CommitmentStatus
  due_date: string | null
  created_at: string
  completed_at: string | null
}

export interface ImpactReport {
  id: string
  profile_id: string
  generated_by: string
  period_start: string
  period_end: string
  summary: string
  report_json: ImpactReportJSON
  created_at: string
}

export interface ImpactReportJSON {
  major_contributions: ReportSection[]
  projects: string[]
  completed_work: ReportSection[]
  collaboration: ReportSection[]
  leadership: ReportSection[]
  skills_demonstrated: string[]
  project_highlights: ReportSection[]
}

export interface ReportSection {
  statement: string
  contribution_ids: string[]
}

export interface ProofRecord {
  id: string
  contribution_id: string
  content_hash: string
  solana_signature: string | null
  network: string
  created_at: string
}

// ─── Joined / enriched types for UI ───────────────────────────
export interface ContributionWithEvidence extends Contribution {
  evidence: ContributionEvidence[]
  skills: string[]
  profile?: Profile
  project?: Project
  meeting?: Meeting
}

export interface MeetingWithParticipants extends Meeting {
  participants: (MeetingParticipant & { profile: Profile })[]
  project?: Project
  contribution_count?: number
}

export interface ProfileWithStats extends Profile {
  contribution_count: number
  project_count: number
  recent_contributions: ContributionWithEvidence[]
  top_skills: { skill: string; count: number }[]
}

// ─── Gemini extraction schema ──────────────────────────────────
export interface GeminiContribution {
  employee_name: string
  type: ContributionType
  title: string
  description: string
  evidence_segment_ids: string[]
  skills: string[]
  confidence: number
}

export interface GeminiCommitment {
  employee_name: string
  description: string
  evidence_segment_ids: string[]
}

export interface GeminiExtractionResult {
  contributions: GeminiContribution[]
  commitments: GeminiCommitment[]
}

// ─── API request/response types ────────────────────────────────
export interface CreateMeetingRequest {
  title: string
  project_id?: string
  participant_ids: string[]
}

export interface ProcessMeetingRequest {
  meeting_id: string
  audio_blob?: string // base64 encoded, optional (uses seeded data if absent in demo mode)
}

export interface GenerateReportRequest {
  profile_id: string
  period_start: string
  period_end: string
}

export interface TranscriptSegmentInput {
  id?: string
  speaker_label: string
  text: string
  start_ms: number
  end_ms: number
}

// ─── UI state types ────────────────────────────────────────────
export interface DemoUser {
  id: string
  name: string
  email: string
  role: ProfileRole
  avatar: string
}
