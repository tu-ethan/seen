import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()

  const { data: meeting, error } = await supabase
    .from('meetings')
    .select(`
      *,
      meeting_participants(profiles(*)),
      transcript_segments(*)
    `)
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { count: contributionsCount } = await supabase
    .from('contributions')
    .select('*', { count: 'exact', head: true })
    .eq('meeting_id', params.id)

  return NextResponse.json({ ...meeting, contributions_count: contributionsCount || 0 })
}
