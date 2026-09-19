import 'server-only'
import type { SeenIdentity } from '@/lib/server/auth'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { encryptSecret } from '@/lib/server/crypto'
import {
  audit,
  claimEmailSource,
  completeEmailSource,
  enqueueOutlookJob,
  failEmailSource,
  listConnections,
  markConnectionSynced,
  readyJobs,
  updateJob,
} from '@/lib/server/database'
import { cleanEmailBody, isSeenLabeled } from '@/lib/integrations/outlook-domain'
import { GeminiOutlookEvidenceExtractor } from './gemini-outlook'
import {
  accessTokenFor,
  getMessageMetadata,
  getOutlookMessage,
  listSeenMessageIds,
  type OutlookMessage,
} from './microsoft-graph'

const errorCode = (error: unknown) => error instanceof Error ? error.message.slice(0, 80) : 'UNKNOWN_ERROR'

export async function queueFallbackSync(identity: SeenIdentity) {
  const config = getOutlookRuntimeConfig()
  if (!config) throw new Error('OUTLOOK_NOT_CONFIGURED')
  const connection = listConnections().find((item) => item.workspaceId === identity.workspaceId && item.employeeId === identity.employeeId)
  if (!connection) throw new Error('OUTLOOK_NOT_CONNECTED')
  const accessToken = await accessTokenFor(connection, config)
  const ids = await listSeenMessageIds(accessToken, connection.lastSyncedAt)
  ids.forEach((id) => enqueueOutlookJob(identity, id, 'FALLBACK_SYNC'))
  markConnectionSynced(connection.id)
  audit(identity, 'OUTLOOK_SYNC_QUEUED', 'outlook_connection', connection.id, { messageCount: ids.length })
  return ids.length
}

export async function processOutlookMessage(identity: SeenIdentity, messageId: string) {
  const config = getOutlookRuntimeConfig()
  if (!config) throw new Error('OUTLOOK_NOT_CONFIGURED')
  const connection = listConnections().find((item) => item.workspaceId === identity.workspaceId && item.employeeId === identity.employeeId)
  if (!connection) throw new Error('OUTLOOK_NOT_CONNECTED')
  const accessToken = await accessTokenFor(connection, config)

  // The first fetch is metadata-only. Content is fetched only after the exact Seen label passes.
  const metadata = await getMessageMetadata(accessToken, messageId)
  if (!isSeenLabeled(metadata.categories)) return { outcome: 'IGNORED_UNLABELED' as const, draftCount: 0 }

  const message: OutlookMessage = await getOutlookMessage(accessToken, messageId)
  if (!isSeenLabeled(message.categories)) return { outcome: 'IGNORED_UNLABELED' as const, draftCount: 0 }
  const cleanedBody = cleanEmailBody(message.body, message.contentType)
  const sourceId = claimEmailSource(identity, {
    microsoftMessageId: message.id,
    conversationId: message.conversationId,
    subject: message.subject,
    sourceTimestamp: message.timestamp,
    encryptedSourceReference: encryptSecret(JSON.stringify({ id: message.id, conversationId: message.conversationId })),
  })
  if (!sourceId) return { outcome: 'ALREADY_PROCESSED' as const, draftCount: 0 }

  try {
    const drafts = cleanedBody
      ? await new GeminiOutlookEvidenceExtractor().extract(message, cleanedBody, { name: connection.microsoftDisplayName, email: connection.microsoftEmail })
      : []
    completeEmailSource(sourceId, drafts)
    audit(identity, 'OUTLOOK_EXTRACTION_COMPLETED', 'processed_email_source', sourceId, { draftCount: drafts.length })
    return { outcome: 'PROCESSED' as const, draftCount: drafts.length }
  } catch (error) {
    failEmailSource(sourceId, errorCode(error))
    audit(identity, 'OUTLOOK_EXTRACTION_FAILED', 'processed_email_source', sourceId)
    throw error
  }
}

export async function processQueuedOutlookJobs(limit = 20) {
  const jobs = readyJobs(limit)
  const summary = { processed: 0, ignored: 0, failed: 0 }
  for (const job of jobs) {
    const id = String(job.id)
    const identity: SeenIdentity = {
      userId: `worker:${String(job.employee_id)}`,
      workspaceId: String(job.workspace_id),
      employeeId: String(job.employee_id),
      role: 'employee',
    }
    updateJob(id, 'PROCESSING')
    try {
      const result = await processOutlookMessage(identity, String(job.microsoft_message_id))
      updateJob(id, 'DONE')
      if (result.outcome === 'IGNORED_UNLABELED') summary.ignored += 1
      else summary.processed += 1
    } catch (error) {
      updateJob(id, 'FAILED', errorCode(error))
      summary.failed += 1
    }
  }
  return summary
}

export async function runFallbackSyncForAllConnections() {
  let queued = 0
  for (const connection of listConnections()) {
    const identity: SeenIdentity = {
      userId: `cron:${connection.employeeId}`,
      workspaceId: connection.workspaceId,
      employeeId: connection.employeeId,
      role: 'employee',
    }
    try { queued += await queueFallbackSync(identity) } catch { /* status is recorded without sensitive provider output */ }
  }
  return queued
}
