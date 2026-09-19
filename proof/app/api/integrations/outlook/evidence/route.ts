import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { audit, deleteImportedEvidence } from '@/lib/server/database'

export async function DELETE(request: Request) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const deleted = deleteImportedEvidence(auth.identity)
  audit(auth.identity, 'OUTLOOK_EVIDENCE_DELETED', 'processed_email_source', undefined, { deleted })
  return NextResponse.json({ deleted })
}
