import { NextResponse } from 'next/server'
import { deleteContribution, updateContribution } from '@/lib/integrations/server/store'
import type { Contribution, ContributionCategory, ContributionEvidence } from '@/types'

const CATEGORIES: ContributionCategory[] = ['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED']

interface UpdateBody {
  category?: ContributionCategory
  title?: string
  description?: string
  evidence?: ContributionEvidence[]
}

function validUpdate(body: UpdateBody) {
  return (!body.category || CATEGORIES.includes(body.category))
    && (!body.title || typeof body.title === 'string')
    && (!body.description || typeof body.description === 'string')
    && (!body.evidence || (Array.isArray(body.evidence) && body.evidence.every((item) => item
      && typeof item.quote === 'string' && typeof item.speaker === 'string' && typeof item.timestamp === 'string')))
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = await request.json() as UpdateBody
  if (!validUpdate(body)) return NextResponse.json({ error: 'Invalid contribution update.' }, { status: 400 })
  const update: Partial<Contribution> = {
    ...(body.category && { category: body.category }),
    ...(body.title?.trim() && { title: body.title.trim() }),
    ...(body.description?.trim() && { description: body.description.trim() }),
    ...(body.evidence && { evidence: body.evidence.map((item) => ({ ...item, quote: item.quote.trim(), speaker: item.speaker.trim(), timestamp: item.timestamp.trim() })) }),
  }
  const contribution = updateContribution(id, update)
  if (!contribution) return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 })
  return NextResponse.json({ contribution })
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!deleteContribution(id)) return NextResponse.json({ error: 'Contribution not found.' }, { status: 404 })
  return new NextResponse(null, { status: 204 })
}
