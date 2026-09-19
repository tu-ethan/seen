import 'server-only'
import { mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import { DatabaseSync } from 'node:sqlite'
import type { SeenIdentity } from './auth'

export interface StoredOutlookConnection {
  id: string
  workspaceId: string
  employeeId: string
  microsoftUserId: string
  microsoftEmail: string
  microsoftDisplayName: string
  encryptedAccessToken: string
  encryptedRefreshToken: string
  accessTokenExpiresAt: string
  scopes: string
  status: string
  lastSyncedAt: string | null
  lastErrorCode: string | null
}

export interface OutlookDraftRecord {
  id: string
  workspaceId: string
  employeeId: string
  sourceId: string
  type: string
  title: string
  description: string
  evidenceExcerpt: string
  confidence: number
  sourceTimestamp: string
  sourceEmailSubject: string
  status: 'DRAFT' | 'APPROVED' | 'DISMISSED'
}

export interface DraftInput {
  type: string
  title: string
  description: string
  evidenceExcerpt: string
  confidence: number
  sourceTimestamp: string
  sourceEmailSubject: string
}

export interface EmailSourceInput {
  microsoftMessageId: string
  conversationId: string
  subject: string
  sourceTimestamp: string
  encryptedSourceReference: string
}

const schema = `
PRAGMA foreign_keys = ON;
DROP TABLE IF EXISTS outlook_jobs;
DROP TABLE IF EXISTS outlook_subscriptions;
CREATE TABLE IF NOT EXISTS outlook_connections (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, employee_id TEXT NOT NULL,
  microsoft_user_id TEXT NOT NULL, microsoft_email TEXT NOT NULL, microsoft_display_name TEXT NOT NULL,
  encrypted_access_token TEXT NOT NULL, encrypted_refresh_token TEXT NOT NULL, access_token_expires_at TEXT NOT NULL,
  scopes TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'CONNECTED', last_synced_at TEXT, last_error_code TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(workspace_id, employee_id)
);
CREATE TABLE IF NOT EXISTS processed_email_sources (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, employee_id TEXT NOT NULL, microsoft_message_id TEXT NOT NULL,
  conversation_id TEXT NOT NULL, subject TEXT NOT NULL, source_timestamp TEXT NOT NULL,
  encrypted_source_reference TEXT NOT NULL, processing_status TEXT NOT NULL, failure_code TEXT,
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(workspace_id, employee_id, microsoft_message_id)
);
CREATE TABLE IF NOT EXISTS contribution_drafts (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, employee_id TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES processed_email_sources(id) ON DELETE CASCADE, candidate_index INTEGER NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'OUTLOOK_EMAIL', contribution_type TEXT NOT NULL, title TEXT NOT NULL,
  description TEXT NOT NULL, evidence_excerpt TEXT NOT NULL, confidence REAL NOT NULL,
  source_timestamp TEXT NOT NULL, source_email_subject TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'DRAFT',
  created_at TEXT NOT NULL, updated_at TEXT NOT NULL, UNIQUE(source_id, candidate_index)
);
CREATE TABLE IF NOT EXISTS audit_events (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, actor_employee_id TEXT NOT NULL, action TEXT NOT NULL,
  resource_type TEXT NOT NULL, resource_id TEXT, metadata_json TEXT NOT NULL DEFAULT '{}', created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_contribution_drafts_owner_status ON contribution_drafts(workspace_id, employee_id, status);
`

declare global {
  // Required by TypeScript for a global declaration shared across Next.js reloads.
  // eslint-disable-next-line no-var
  var seenProofDatabase: DatabaseSync | undefined
}

function databasePath() {
  return resolve(process.cwd(), process.env.SEEN_DATABASE_PATH ?? 'data/seen-proof.db')
}

export function database() {
  if (!globalThis.seenProofDatabase) {
    const path = databasePath()
    mkdirSync(dirname(path), { recursive: true })
    const instance = new DatabaseSync(path)
    instance.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;')
    instance.exec(schema)
    globalThis.seenProofDatabase = instance
  }
  return globalThis.seenProofDatabase
}

const text = (row: Record<string, unknown>, key: string) => String(row[key] ?? '')
const nullableText = (row: Record<string, unknown>, key: string) => row[key] == null ? null : String(row[key])

function connectionFromRow(row: Record<string, unknown>): StoredOutlookConnection {
  return {
    id: text(row, 'id'), workspaceId: text(row, 'workspace_id'), employeeId: text(row, 'employee_id'),
    microsoftUserId: text(row, 'microsoft_user_id'), microsoftEmail: text(row, 'microsoft_email'),
    microsoftDisplayName: text(row, 'microsoft_display_name'), encryptedAccessToken: text(row, 'encrypted_access_token'),
    encryptedRefreshToken: text(row, 'encrypted_refresh_token'), accessTokenExpiresAt: text(row, 'access_token_expires_at'),
    scopes: text(row, 'scopes'), status: text(row, 'status'), lastSyncedAt: nullableText(row, 'last_synced_at'),
    lastErrorCode: nullableText(row, 'last_error_code'),
  }
}

export function getConnection(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>) {
  const row = database().prepare('SELECT * FROM outlook_connections WHERE workspace_id = ? AND employee_id = ?')
    .get(identity.workspaceId, identity.employeeId)
  return row ? connectionFromRow(row) : null
}

export function saveConnection(input: Omit<StoredOutlookConnection, 'id' | 'status' | 'lastSyncedAt' | 'lastErrorCode'>) {
  const now = new Date().toISOString()
  const existing = getConnection(input)
  const id = existing?.id ?? randomUUID()
  database().prepare(`INSERT INTO outlook_connections (
    id, workspace_id, employee_id, microsoft_user_id, microsoft_email, microsoft_display_name,
    encrypted_access_token, encrypted_refresh_token, access_token_expires_at, scopes, status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'CONNECTED', ?, ?)
  ON CONFLICT(workspace_id, employee_id) DO UPDATE SET
    microsoft_user_id=excluded.microsoft_user_id, microsoft_email=excluded.microsoft_email,
    microsoft_display_name=excluded.microsoft_display_name, encrypted_access_token=excluded.encrypted_access_token,
    encrypted_refresh_token=excluded.encrypted_refresh_token, access_token_expires_at=excluded.access_token_expires_at,
    scopes=excluded.scopes, status='CONNECTED', last_error_code=NULL, updated_at=excluded.updated_at`)
    .run(id, input.workspaceId, input.employeeId, input.microsoftUserId, input.microsoftEmail, input.microsoftDisplayName,
      input.encryptedAccessToken, input.encryptedRefreshToken, input.accessTokenExpiresAt, input.scopes, now, now)
  return getConnection(input)
}

export function updateConnectionTokens(id: string, encryptedAccessToken: string, encryptedRefreshToken: string, expiresAt: string) {
  database().prepare("UPDATE outlook_connections SET encrypted_access_token=?, encrypted_refresh_token=?, access_token_expires_at=?, status='CONNECTED', last_error_code=NULL, updated_at=? WHERE id=?")
    .run(encryptedAccessToken, encryptedRefreshToken, expiresAt, new Date().toISOString(), id)
}

export function markConnectionError(id: string, code: string) {
  database().prepare("UPDATE outlook_connections SET status='RECONNECT_REQUIRED', last_error_code=?, updated_at=? WHERE id=?")
    .run(code, new Date().toISOString(), id)
}

export function markConnectionSynced(id: string) {
  const now = new Date().toISOString()
  database().prepare("UPDATE outlook_connections SET last_synced_at=?, status='CONNECTED', last_error_code=NULL, updated_at=? WHERE id=?").run(now, now, id)
}

export function disconnectOutlook(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>) {
  database().prepare('DELETE FROM outlook_connections WHERE workspace_id=? AND employee_id=?').run(identity.workspaceId, identity.employeeId)
}

export function hasProcessedEmailSource(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>, messageId: string) {
  const row = database().prepare(`SELECT processing_status FROM processed_email_sources
    WHERE workspace_id=? AND employee_id=? AND microsoft_message_id=?`)
    .get(identity.workspaceId, identity.employeeId, messageId)
  return row ? String(row.processing_status) !== 'FAILED' : false
}

export function claimEmailSource(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>, source: EmailSourceInput) {
  const now = new Date().toISOString()
  const existing = database().prepare(`SELECT id, processing_status FROM processed_email_sources
    WHERE workspace_id=? AND employee_id=? AND microsoft_message_id=?`)
    .get(identity.workspaceId, identity.employeeId, source.microsoftMessageId)
  if (existing) {
    if (String(existing.processing_status) !== 'FAILED') return null
    const id = String(existing.id)
    database().prepare(`UPDATE processed_email_sources SET conversation_id=?, subject=?, source_timestamp=?,
      encrypted_source_reference=?, processing_status='PROCESSING', failure_code=NULL, updated_at=?
      WHERE id=? AND workspace_id=? AND employee_id=?`)
      .run(source.conversationId, source.subject, source.sourceTimestamp, source.encryptedSourceReference,
        now, id, identity.workspaceId, identity.employeeId)
    return id
  }
  const id = randomUUID()
  const result = database().prepare(`INSERT OR IGNORE INTO processed_email_sources (
    id, workspace_id, employee_id, microsoft_message_id, conversation_id, subject, source_timestamp,
    encrypted_source_reference, processing_status, created_at, updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PROCESSING', ?, ?)`)
    .run(id, identity.workspaceId, identity.employeeId, source.microsoftMessageId, source.conversationId,
      source.subject, source.sourceTimestamp, source.encryptedSourceReference, now, now)
  if (result.changes === 0) return null
  return id
}

export function completeEmailSource(sourceId: string, drafts: DraftInput[]) {
  const db = database()
  const now = new Date().toISOString()
  db.exec('BEGIN IMMEDIATE')
  try {
    const source = db.prepare('SELECT workspace_id, employee_id FROM processed_email_sources WHERE id=?').get(sourceId)
    if (!source) throw new Error('Email source not found')
    drafts.forEach((draft, index) => {
      db.prepare(`INSERT OR IGNORE INTO contribution_drafts (
        id, workspace_id, employee_id, source_id, candidate_index, source_type, contribution_type, title,
        description, evidence_excerpt, confidence, source_timestamp, source_email_subject, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'OUTLOOK_EMAIL', ?, ?, ?, ?, ?, ?, ?, 'DRAFT', ?, ?)`)
        .run(randomUUID(), String(source.workspace_id), String(source.employee_id), sourceId, index, draft.type, draft.title,
          draft.description, draft.evidenceExcerpt, draft.confidence, draft.sourceTimestamp, draft.sourceEmailSubject, now, now)
    })
    db.prepare("UPDATE processed_email_sources SET processing_status=?, failure_code=NULL, updated_at=? WHERE id=?")
      .run(drafts.length ? 'DRAFTS_CREATED' : 'NO_EVIDENCE', now, sourceId)
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }
}

export function failEmailSource(sourceId: string, code: string) {
  database().prepare("UPDATE processed_email_sources SET processing_status='FAILED', failure_code=?, updated_at=? WHERE id=?")
    .run(code, new Date().toISOString(), sourceId)
}

function draftFromRow(row: Record<string, unknown>): OutlookDraftRecord {
  const status = text(row, 'status')
  if (status !== 'DRAFT' && status !== 'APPROVED' && status !== 'DISMISSED') throw new Error('Invalid contribution status')
  return {
    id: text(row, 'id'), workspaceId: text(row, 'workspace_id'), employeeId: text(row, 'employee_id'),
    sourceId: text(row, 'source_id'), type: text(row, 'contribution_type'), title: text(row, 'title'),
    description: text(row, 'description'), evidenceExcerpt: text(row, 'evidence_excerpt'),
    confidence: Number(row.confidence), sourceTimestamp: text(row, 'source_timestamp'),
    sourceEmailSubject: text(row, 'source_email_subject'), status,
  }
}

export function listEmployeeDrafts(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>, status?: OutlookDraftRecord['status']) {
  const rows = status
    ? database().prepare('SELECT * FROM contribution_drafts WHERE workspace_id=? AND employee_id=? AND status=? ORDER BY source_timestamp DESC').all(identity.workspaceId, identity.employeeId, status)
    : database().prepare('SELECT * FROM contribution_drafts WHERE workspace_id=? AND employee_id=? ORDER BY source_timestamp DESC').all(identity.workspaceId, identity.employeeId)
  return rows.map(draftFromRow)
}

export function updateEmployeeDraft(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>, id: string, input: { status?: OutlookDraftRecord['status']; title?: string; description?: string }) {
  const current = database().prepare('SELECT * FROM contribution_drafts WHERE id=? AND workspace_id=? AND employee_id=?').get(id, identity.workspaceId, identity.employeeId)
  if (!current) return null
  const title = input.title?.trim() || text(current, 'title')
  const description = input.description?.trim() || text(current, 'description')
  const status = input.status ?? text(current, 'status')
  database().prepare('UPDATE contribution_drafts SET title=?, description=?, status=?, updated_at=? WHERE id=? AND workspace_id=? AND employee_id=?')
    .run(title, description, status, new Date().toISOString(), id, identity.workspaceId, identity.employeeId)
  const updated = database().prepare('SELECT * FROM contribution_drafts WHERE id=? AND workspace_id=? AND employee_id=?').get(id, identity.workspaceId, identity.employeeId)
  return updated ? draftFromRow(updated) : null
}

export function listApprovedForManager(workspaceId: string, employeeId: string) {
  return database().prepare("SELECT * FROM contribution_drafts WHERE workspace_id=? AND employee_id=? AND status='APPROVED' ORDER BY source_timestamp DESC")
    .all(workspaceId, employeeId).map(draftFromRow)
}

export function deleteImportedEvidence(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>) {
  const result = database().prepare('DELETE FROM processed_email_sources WHERE workspace_id=? AND employee_id=?').run(identity.workspaceId, identity.employeeId)
  return result.changes
}

export function audit(identity: Pick<SeenIdentity, 'workspaceId' | 'employeeId'>, action: string, resourceType: string, resourceId?: string, metadata: Record<string, string | number | boolean> = {}) {
  database().prepare('INSERT INTO audit_events (id, workspace_id, actor_employee_id, action, resource_type, resource_id, metadata_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(randomUUID(), identity.workspaceId, identity.employeeId, action, resourceType, resourceId ?? null, JSON.stringify(metadata), new Date().toISOString())
}
