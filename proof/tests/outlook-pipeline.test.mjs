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

test('unlabeled emails are never eligible and the category match is exact', () => {
  assert.equal(isSeenLabeled(undefined), false)
  assert.equal(isSeenLabeled([]), false)
  assert.equal(isSeenLabeled(['Important', 'seen']), false)
  assert.equal(isSeenLabeled(['Important', 'Seen']), true)
})

test('labeled extraction records default to private DRAFT status', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-outlook-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(readFileSync(new URL('../migrations/001_outlook_evidence.sql', import.meta.url), 'utf8'))
    const now = new Date().toISOString()
    db.prepare(`INSERT INTO processed_email_sources
      (id, workspace_id, employee_id, microsoft_message_id, conversation_id, subject, source_timestamp, encrypted_source_reference, processing_status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('source-1', 'workspace-a', 'employee-a', 'message-1', 'conversation-1', 'Evidence', now, 'encrypted', 'PROCESSING', now, now)
    db.prepare(`INSERT INTO contribution_drafts
      (id, workspace_id, employee_id, source_id, candidate_index, contribution_type, title, description, evidence_excerpt, confidence, source_timestamp, source_email_subject, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .run('draft-1', 'workspace-a', 'employee-a', 'source-1', 0, 'SHIPPED', 'Delivered change', 'Delivered the change.', 'I delivered the change.', 0.94, now, 'Evidence', now, now)
    assert.equal(db.prepare('SELECT status FROM contribution_drafts WHERE id=?').get('draft-1').status, 'DRAFT')
  } finally { db.close(); rmSync(directory, { recursive: true, force: true }) }
})

test('duplicate webhook deliveries cannot duplicate sources or draft cards', () => {
  const directory = mkdtempSync(join(tmpdir(), 'seen-outlook-'))
  const db = new DatabaseSync(join(directory, 'test.db'))
  try {
    db.exec(readFileSync(new URL('../migrations/001_outlook_evidence.sql', import.meta.url), 'utf8'))
    const now = new Date().toISOString()
    const insertSource = db.prepare(`INSERT OR IGNORE INTO processed_email_sources
      (id, workspace_id, employee_id, microsoft_message_id, conversation_id, subject, source_timestamp, encrypted_source_reference, processing_status, created_at, updated_at)
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
