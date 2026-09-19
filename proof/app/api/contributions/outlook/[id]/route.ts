import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { audit, updateEmployeeDraft, type OutlookDraftRecord } from '@/lib/server/database'

interface UpdateBody { action?: 'approve' | 'dismiss' | 'edit'; title?: string; description?: string }

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = requireIdentity(request, 'employee')
  if ('response' in auth) return auth.response
  const { id } = await context.params
  const body = await request.json() as UpdateBody
  let status: OutlookDraftRecord['status'] | undefined
  if (body.action === 'approve') status = 'APPROVED'
  if (body.action === 'dismiss') status = 'DISMISSED'
  if (!status && body.action !== 'edit') return NextResponse.json({ error: 'Invalid contribution action.' }, { status: 400 })
  const updated = updateEmployeeDraft(auth.identity, id, { status, title: body.title, description: body.description })
  if (!updated) return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 })
  audit(auth.identity, `OUTLOOK_CONTRIBUTION_${body.action?.toUpperCase()}`, 'contribution_draft', id)
  return NextResponse.json({ contribution: updated })
}
