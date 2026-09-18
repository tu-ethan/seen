import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const profileId = searchParams.get('profile_id')
  const projectId = searchParams.get('project_id')
  const type = searchParams.get('type')
  const limit = parseInt(searchParams.get('limit') || '20', 10)
  const offset = parseInt(searchParams.get('offset') || '0', 10)

  if (!profileId) {
    return NextResponse.json({ error: 'profile_id is required' }, { status: 400 })
  }

  const supabase = createServerClient()
  let query = supabase
    .from('contributions')
    .select('*, projects(*), meetings(title), contribution_evidence(transcript_segments(*))')
    .eq('profile_id', profileId)
    .order('occurred_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (projectId) query = query.eq('project_id', projectId)
  if (type) query = query.eq('type', type)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
