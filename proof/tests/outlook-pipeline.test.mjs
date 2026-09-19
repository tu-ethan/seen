import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { DatabaseSync } from 'node:sqlite'
import {
  cleanEmailBody,
  employeeCanAccessSource,
  isSeenLabeled,
  managerContributionProjection,
  parseGeminiCandidates,
} from '../lib/integrations/outlook-domain.ts'
import { parseGmailMessage } from '../lib/integrations/gmail-message.ts'

const encoded = (value) => Buffer.from(value).toString('base64url')

test('unlabeled emails are never eligible and the category match is exact', () => {
  assert.equal(isSeenLabeled(undefined), false)
  assert.equal(isSeenLabeled([]), false)
  assert.equal(isSeenLabeled(['Important', 'seen']), false)
  assert.equal(isSeenLabeled(['Important', 'Seen']), true)
})

test('Gmail parsing prefers plain text and ignores attachment bodies', () => {
  const message = parseGmailMessage({
    id: 'gmail-message-1',
    labelIds: ['label-seen'],
    internalDate: '1789819200000',
    payload: {
      mimeType: 'multipart/mixed',
      headers: [
        { name: 'Subject', value: 'Controller handoff' },
        { name: 'From', value: 'Maya <maya@example.com>' },
        { name: 'To', value: 'Pat <pat@example.com>' },
      ],
      parts: [
        { mimeType: 'text/plain', body: { data: encoded('I delivered the controller handoff.') } },
        { mimeType: 'text/html', body: { data: encoded('<p>HTML alternative</p>') } },
        { mimeType: 'text/plain', filename: 'private.txt', body: { data: encoded('attachment secret') } },
      ],
    },
  }, 'label-seen')
  assert.equal(message.body, 'I delivered the controller handoff.')
  assert.equal(message.contentType, 'text')
  assert.deepEqual(message.labels, ['Seen'])
  assert.doesNotMatch(message.body, /attachment secret|HTML alternative/)
})

test('labeled extraction records default to private DRAFT status', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-outlook-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(readFileSync(new URL('../migrations/001_outlook_evidence.sql', import.meta.url), 'utf8'))
    const now = new Date().toISOString()
    db.prepare(`INSERT INTO processed_email_sources
      (id, workspace_id, employee_id, gmail_message_id, conversation_id, subject, source_timestamp, encrypted_source_reference, processing_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('source-1', 'workspace-a', 'employee-a', 'message-1', 'conversation-1', 'Evidence', now, 'encrypted', 'PROCESSING', now, now)
    db.prepare(`INSERT INTO contribution_drafts
      (id, workspace_id, employee_id, source_id, candidate_index, contribution_type, title, description, evidence_excerpt, confidence, source_timestamp, source_email_subject, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('draft-1', 'workspace-a', 'employee-a', 'source-1', 0, 'SHIPPED', 'Delivered change', 'Delivered the change.', 'I delivered the change.', 0.94, now, 'Evidence', now, now)
    assert.equal(db.prepare('SELECT status FROM contribution_drafts WHERE id=?').get('draft-1').status, 'DRAFT')
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }) }
})

test('repeated manual syncs cannot duplicate sources or draft cards', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-outlook-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(readFileSync(new URL('../migrations/001_outlook_evidence.sql', import.meta.url), 'utf8'))
    const now = new Date().toISOString()
    const insertSource = db.prepare(`INSERT OR IGNORE INTO processed_email_sources
      (id, workspace_id, employee_id, gmail_message_id, conversation_id, subject, source_timestamp, encrypted_source_reference, processing_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    assert.equal(insertSource.run('source-1', 'workspace-a', 'employee-a', 'message-1', 'conversation-1', 'Evidence', now, 'encrypted', 'PROCESSING', now, now).changes, 1)
    assert.equal(insertSource.run('source-2', 'workspace-a', 'employee-a', 'message-1', 'conversation-1', 'Evidence', now, 'encrypted', 'PROCESSING', now, now).changes, 0)
    const insertDraft = db.prepare(`INSERT OR IGNORE INTO contribution_drafts
      (id, workspace_id, employee_id, source_id, candidate_index, contribution_type, title, description, evidence_excerpt, confidence, source_timestamp, source_email_subject, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
    insertDraft.run('draft-1', 'workspace-a', 'employee-a', 'source-1', 0, 'SHIPPED', 'Delivered', 'Delivered.', 'I delivered.', 0.9, now, 'Evidence', now, now)
    assert.equal(insertDraft.run('draft-2', 'workspace-a', 'employee-a', 'source-1', 0, 'SHIPPED', 'Delivered', 'Delivered.', 'I delivered.', 0.9, now, 'Evidence', now, now).changes, 0)
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM contribution_drafts').get().count, 1)
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }) }
})

test('the Outlook schema has no subscription or background job tables', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-outlook-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(readFileSync(new URL('../migrations/001_outlook_evidence.sql', import.meta.url), 'utf8'))
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map((row) => row.name)
    assert.equal(tables.includes('gmail_connections'), true)
    assert.equal(tables.includes('outlook_connections'), false)
    assert.equal(tables.includes('outlook_subscriptions'), false)
    assert.equal(tables.includes('outlook_jobs'), false)
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }) }
})

test('the Gmail migration discards incompatible Microsoft tokens and preserves source history', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-gmail-migration-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(`
      CREATE TABLE outlook_connections (
        id TEXT PRIMARY KEY, workspace_id TEXT, employee_id TEXT, microsoft_user_id TEXT,
        microsoft_email TEXT, microsoft_display_name TEXT, encrypted_access_token TEXT,
        encrypted_refresh_token TEXT, access_token_expires_at TEXT, scopes TEXT, status TEXT,
        last_synced_at TEXT, last_error_code TEXT, created_at TEXT, updated_at TEXT
      );
      CREATE TABLE processed_email_sources (
        id TEXT PRIMARY KEY, workspace_id TEXT, employee_id TEXT, microsoft_message_id TEXT,
        conversation_id TEXT, subject TEXT, source_timestamp TEXT, encrypted_source_reference TEXT,
        processing_status TEXT, failure_code TEXT, created_at TEXT, updated_at TEXT
      );
      INSERT INTO outlook_connections VALUES (
        'connection-1', 'workspace-a', 'employee-a', 'microsoft-user', 'maya@example.com', 'Maya',
        'access', 'refresh', '2026-09-19T12:00:00Z', 'Mail.Read', 'CONNECTED', NULL, NULL,
        '2026-09-19T12:00:00Z', '2026-09-19T12:00:00Z'
      );
      INSERT INTO processed_email_sources VALUES (
        'source-1', 'workspace-a', 'employee-a', 'old-message', '', 'Evidence',
        '2026-09-19T12:00:00Z', 'encrypted', 'NO_EVIDENCE', NULL,
        '2026-09-19T12:00:00Z', '2026-09-19T12:00:00Z'
      );
    `)
    db.exec(readFileSync(new URL('../migrations/003_gmail_backend.sql', import.meta.url), 'utf8'))
    assert.equal(db.prepare('SELECT COUNT(*) AS count FROM gmail_connections').get().count, 0)
    assert.equal(db.prepare('SELECT gmail_message_id FROM processed_email_sources').get().gmail_message_id, 'old-message')
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }) }
})

test('employee ownership requires both matching workspace and employee', () => {
  const owner = { workspaceId: 'workspace-a', employeeId: 'employee-a' }
  assert.equal(employeeCanAccessSource(owner, { workspaceId: 'workspace-a', employeeId: 'employee-a' }), true)
  assert.equal(employeeCanAccessSource(owner, { workspaceId: 'workspace-a', employeeId: 'employee-b' }), false)
  assert.equal(employeeCanAccessSource(owner, { workspaceId: 'workspace-b', employeeId: 'employee-a' }), false)
})

test('manager projection hides drafts and never includes a raw email body', () => {
  const draft = { status: 'DRAFT', title: 'Draft', description: 'Private', evidenceExcerpt: 'Excerpt', rawBody: 'whole email' }
  assert.equal(managerContributionProjection(draft), null)
  const approved = managerContributionProjection({ ...draft, status: 'APPROVED' })
  assert.deepEqual(approved, { title: 'Draft', description: 'Private', evidenceExcerpt: 'Excerpt' })
  assert.equal(Object.hasOwn(approved, 'rawBody'), false)
})

test('malformed Gemini responses create no valid contribution candidates', () => {
  const source = 'I completed the controller handoff.'
  assert.equal(parseGeminiCandidates({ contributions: [{ title: 'Missing fields' }] }, source), null)
  assert.equal(parseGeminiCandidates({ contributions: [{
    type: 'SHIPPED', title: 'Controller handoff', description: 'Completed the handoff.', evidenceExcerpt: 'A fabricated quote',
    confidence: 0.9, sourceTimestamp: '2026-09-19T12:00:00Z', sourceEmailSubject: 'Handoff',
  }] }, source), null)
})

test('email cleaning removes quoted chains, signatures, HTML, tracking, and obvious tokens', () => {
  const cleaned = cleanEmailBody('<p>I delivered the fix.</p><p>api_key=secret-value</p><p>Thanks,</p><p>Maya</p><p>On Fri Pat wrote:</p><p>old reply</p>', 'html')
  assert.match(cleaned, /I delivered the fix/)
  assert.match(cleaned, /\[removed\]/)
  assert.doesNotMatch(cleaned, /old reply|Maya/)
})
