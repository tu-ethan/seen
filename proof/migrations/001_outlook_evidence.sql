PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS outlook_connections (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  microsoft_user_id TEXT NOT NULL,
  microsoft_email TEXT NOT NULL,
  microsoft_display_name TEXT NOT NULL,
  encrypted_access_token TEXT NOT NULL,
  encrypted_refresh_token TEXT NOT NULL,
  access_token_expires_at TEXT NOT NULL,
  scopes TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'CONNECTED',
  last_synced_at TEXT,
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, employee_id)
);

CREATE TABLE IF NOT EXISTS outlook_subscriptions (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  connection_id TEXT NOT NULL REFERENCES outlook_connections(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, employee_id, connection_id)
);

CREATE TABLE IF NOT EXISTS processed_email_sources (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  microsoft_message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  source_timestamp TEXT NOT NULL,
  encrypted_source_reference TEXT NOT NULL,
  processing_status TEXT NOT NULL,
  failure_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, employee_id, microsoft_message_id)
);

CREATE TABLE IF NOT EXISTS contribution_drafts (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES processed_email_sources(id) ON DELETE CASCADE,
  candidate_index INTEGER NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'OUTLOOK_EMAIL',
  contribution_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  evidence_excerpt TEXT NOT NULL,
  confidence REAL NOT NULL,
  source_timestamp TEXT NOT NULL,
  source_email_subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(source_id, candidate_index)
);

CREATE TABLE IF NOT EXISTS outlook_jobs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  microsoft_message_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'QUEUED',
  attempts INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  last_error_code TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, employee_id, microsoft_message_id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  actor_employee_id TEXT NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_outlook_jobs_ready ON outlook_jobs(status, available_at);
CREATE INDEX IF NOT EXISTS idx_contribution_drafts_owner_status ON contribution_drafts(workspace_id, employee_id, status);
CREATE INDEX IF NOT EXISTS idx_outlook_subscriptions_expiry ON outlook_subscriptions(status, expires_at);
