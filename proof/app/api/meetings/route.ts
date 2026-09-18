import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@auth0/nextjs-auth0'
import { createServerClient } from '@/lib/supabase/server'

async function getCurrentUserId(req: NextRequest): Promise<string | null> {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    const demoId = req.headers.get('x-demo-user-id')
    if (demoId) return demoId
  }
  const session = await getSession(req as any, {} as any)
  if (session?.user) {
    const supabase = createServerClient()
    const { data } = await supabase.from('profiles').select('id').eq('auth_user_id', session.user.sub).single()
    return data?.id || null
  }
  return null
}

export async function GET(req: NextRequest) {
  const userId = await getCurrentUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServerClient()
  
  // Since we don't know the exact hierarchy from types yet, we just return meetings the user is participant of
  const { data: meetings, error } = await supabase
    .from('meetings')
    .select('*, meeting_participants!inner(profile_id)')
    .eq('meeting_participants.profile_id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(meetings)
}

export async function POST(req: NextRequest) {
  const userId = await getCurrentUserId(req)
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { title, project_id, participant_ids } = body

  if (!title || !participant_ids || !Array.isArray(participant_ids)) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Ensure current user is in participants
  const finalParticipantIds = Array.from(new Set([...participant_ids, userId]))

  const { data: meeting, error: meetingError } = await supabase
    .from('meetings')
    .insert({ title, project_id, recorded_by_id: userId, status: 'SCHEDULED' })
    .select()
    .single()

  if (meetingError) return NextResponse.json({ error: meetingError.message }, { status: 500 })

  const participants = finalParticipantIds.map(id => ({ meeting_id: meeting.id, profile_id: id }))
  const { error: participantsError } = await supabase.from('meeting_participants').insert(participants)

  if (participantsError) return NextResponse.json({ error: participantsError.message }, { status: 500 })

  return NextResponse.json(meeting)
}
