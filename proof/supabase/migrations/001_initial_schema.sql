-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tables
CREATE TABLE profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id text UNIQUE NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    role text NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER')),
    job_title text,
    manager_id uuid REFERENCES profiles(id),
    avatar_url text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE teams (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    manager_id uuid NOT NULL REFERENCES profiles(id),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES teams(id),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    UNIQUE(team_id, profile_id)
);

CREATE TABLE projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','COMPLETED','PAUSED','ARCHIVED')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE project_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES projects(id),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    role text,
    UNIQUE(project_id, profile_id)
);

CREATE TABLE meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    project_id uuid REFERENCES projects(id),
    started_at timestamptz,
    ended_at timestamptz,
    created_by uuid NOT NULL REFERENCES profiles(id),
    status text NOT NULL DEFAULT 'RECORDING' CHECK (status IN ('RECORDING','PROCESSING','COMPLETE','FAILED')),
    audio_url text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE meeting_participants (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES meetings(id),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    speaker_label text,
    UNIQUE(meeting_id, profile_id)
);

CREATE TABLE transcript_segments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id uuid NOT NULL REFERENCES meetings(id),
    profile_id uuid REFERENCES profiles(id),
    speaker_label text,
    text text NOT NULL,
    start_ms integer,
    end_ms integer,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE contributions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    meeting_id uuid REFERENCES meetings(id),
    project_id uuid REFERENCES projects(id),
    type text NOT NULL CHECK (type IN ('EXECUTION','OWNERSHIP','IDEATION','RESEARCH','COLLABORATION','LEADERSHIP')),
    title text NOT NULL,
    description text NOT NULL,
    occurred_at timestamptz NOT NULL DEFAULT now(),
    confidence numeric(3,2) NOT NULL DEFAULT 0.85,
    status text NOT NULL DEFAULT 'AI_EXTRACTED' CHECK (status IN ('AI_EXTRACTED','VERIFIED','DISMISSED')),
    created_at timestamptz DEFAULT now()
);

CREATE TABLE contribution_evidence (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id uuid NOT NULL REFERENCES contributions(id) ON DELETE CASCADE,
    transcript_segment_id uuid REFERENCES transcript_segments(id),
    evidence_text text NOT NULL,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text UNIQUE NOT NULL
);

CREATE TABLE employee_skills (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    skill_id uuid NOT NULL REFERENCES skills(id),
    contribution_id uuid REFERENCES contributions(id),
    confidence numeric(3,2) DEFAULT 0.85,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE commitments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    meeting_id uuid REFERENCES meetings(id),
    project_id uuid REFERENCES projects(id),
    description text NOT NULL,
    status text NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN','COMPLETE','CANCELLED')),
    due_date timestamptz,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

CREATE TABLE impact_reports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id uuid NOT NULL REFERENCES profiles(id),
    generated_by uuid NOT NULL REFERENCES profiles(id),
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    summary text NOT NULL,
    report_json jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE proof_records (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    contribution_id uuid NOT NULL REFERENCES contributions(id),
    content_hash text NOT NULL,
    solana_signature text,
    network text NOT NULL DEFAULT 'devnet',
    created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_contributions_profile_id ON contributions(profile_id);
CREATE INDEX idx_contributions_meeting_id ON contributions(meeting_id);
CREATE INDEX idx_contributions_project_id ON contributions(project_id);
CREATE INDEX idx_transcript_segments_meeting_id ON transcript_segments(meeting_id);
CREATE INDEX idx_employee_skills_profile_id ON employee_skills(profile_id);
CREATE INDEX idx_meeting_participants_meeting_id ON meeting_participants(meeting_id);
CREATE INDEX idx_meeting_participants_profile_id ON meeting_participants(profile_id);

-- Helper function
CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM profiles WHERE auth_user_id = COALESCE(
    current_setting('request.jwt.claims', true)::jsonb ->> 'sub',
    (current_setting('request.jwt.claims', true)::jsonb ->> 'id')
  ) LIMIT 1;
$$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcript_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE commitments ENABLE ROW LEVEL SECURITY;
ALTER TABLE impact_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE proof_records ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Employees can view own profile" ON profiles
    FOR SELECT USING (id = get_profile_id());

CREATE POLICY "Managers can view team profiles" ON profiles
    FOR SELECT USING (
        get_profile_id() = manager_id OR
        id = get_profile_id()
    );

-- Projects Policies
CREATE POLICY "Employees can view own projects" ON projects
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM project_members 
            WHERE project_members.project_id = projects.id 
            AND project_members.profile_id = get_profile_id()
        )
    );

-- Meetings Policies
CREATE POLICY "Employees can view own meetings" ON meetings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meeting_participants 
            WHERE meeting_participants.meeting_id = meetings.id 
            AND meeting_participants.profile_id = get_profile_id()
        )
    );

CREATE POLICY "Managers can insert/update own meetings" ON meetings
    FOR ALL USING (created_by = get_profile_id());

-- Contributions Policies
CREATE POLICY "Employees can view own contributions" ON contributions
    FOR SELECT USING (profile_id = get_profile_id());

-- Evidence Policies
CREATE POLICY "Employees can view own evidence" ON contribution_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM contributions 
            WHERE contributions.id = contribution_evidence.contribution_id 
            AND contributions.profile_id = get_profile_id()
        )
    );

-- Hackathon/Demo: Allow full access to other tables for authenticated users for demo purposes
-- or rely on service role bypass. 
-- By default, service_role bypasses RLS in Supabase.
