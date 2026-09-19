import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { getOutlookRuntimeConfig } from '@/lib/server/config'
import { encryptSecret } from '@/lib/server/crypto'
import {
  audit,
  claimEmailSource,
  completeEmailSource,
  failEmailSource,
  getConnection,
  hasProcessedEmailSource,
  markConnectionSynced,
} from '@/lib/server/database'
import { cleanEmailBody, isSeenLabeled } from '@/lib/integrations/outlook-domain'
import { GeminiOutlookEvidenceExtractor } from '@/lib/integrations/server/gemini-outlook'
import { accessTokenFor, getOutlookMessage, listSeenMessageIds } from '@/lib/integrations/server/microsoft-graph'

const safeErrorCode = (error: unknown) => error instanceof Error ? error.message.slice(0, 80) : 'UNKNOWN_ERROR'

export async function POST(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const config = getOutlookRuntimeConfig()
  if (!config) return NextResponse.json({ error: 'OUTLOOK_NOT_CONFIGURED' }, { status: 503 })
  const connection = getConnection(auth.identity)
  if (!connection) return NextResponse.json({ error: 'OUTLOOK_NOT_CONNECTED' }, { status: 409 })

  try {
    const accessToken = await accessTokenFor(connection, config)
    const messageIds = await listSeenMessageIds(accessToken)
    const counts = { checked: messageIds.length, skipped: 0, evidenceCreated: 0, failed: 0 }

    for (const messageId of messageIds) {
      if (hasProcessedEmailSource(auth.identity, messageId)) {
        counts.skipped += 1
        continue
      }

      let sourceId: string | null = null
      try {
        const message = await getOutlookMessage(accessToken, messageId)
        if (!isSeenLabeled(message.categories)) {
          counts.skipped += 1
          continue
        }
        const cleanedBody = cleanEmailBody(message.body, message.contentType)
        sourceId = claimEmailSource(auth.identity, {
          microsoftMessageId: message.id,
          conversationId: '',
          subject: message.subject,
          sourceTimestamp: message.timestamp,
          encryptedSourceReference: encryptSecret(JSON.stringify({ id: message.id })),
        })
        if (!sourceId) {
          counts.skipped += 1
          continue
        }

        const drafts = cleanedBody
          ? await new GeminiOutlookEvidenceExtractor().extract(message, cleanedBody, {
            name: connection.microsoftDisplayName,
            email: connection.microsoftEmail,
          })
          : []
        completeEmailSource(sourceId, drafts)
        counts.evidenceCreated += drafts.length
        if (!drafts.length) counts.skipped += 1
        audit(auth.identity, 'OUTLOOK_EXTRACTION_COMPLETED', 'processed_email_source', sourceId, { evidenceCreated: drafts.length })
      } catch (error) {
        if (sourceId) failEmailSource(sourceId, safeErrorCode(error))
        counts.failed += 1
        audit(auth.identity, 'OUTLOOK_EXTRACTION_FAILED', 'processed_email_source', sourceId ?? messageId)
      }
    }

    markConnectionSynced(connection.id)
    audit(auth.identity, 'OUTLOOK_SYNC_COMPLETED', 'outlook_connection', connection.id, counts)
    return NextResponse.json(counts)
  } catch (error) {
    const code = error instanceof Error ? error.message : 'SYNC_FAILED'
    return NextResponse.json({ error: code }, { status: 502 })
  }
}
