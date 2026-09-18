import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getTranscriptionProvider } from '@/lib/providers/transcription'
import { getExtractionProvider } from '@/lib/providers/extraction'
import { getProofProvider } from '@/lib/providers/proof'
import { TranscriptSegmentInput } from '@/types'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = createServerClient()
  const meetingId = params.id

  try {
    // 1. Get meeting
    const { data: meeting, error: meetingError } = await supabase
      .from('meetings')
      .select('*, projects(name), meeting_participants(profiles(id, name, title))')
      .eq('id', meetingId)
      .single()

    if (meetingError || !meeting) throw new Error('Meeting not found')

    // 2. Set status processing
    await supabase.from('meetings').update({ status: 'PROCESSING' }).eq('id', meetingId)

    // 3. Get participants
    const participants = meeting.meeting_participants.map((mp: any) => ({
      name: mp.profiles.name,
      label: mp.profiles.title || 'Participant',
      id: mp.profiles.id
    }))

    // 4. Get audio blob
    const formData = await req.formData().catch(() => null)
    let segments: TranscriptSegmentInput[] = []
    
    const transcriptionProvider = getTranscriptionProvider()
    if (formData && formData.has('audio')) {
      const audioBlob = formData.get('audio') as Blob
      segments = await transcriptionProvider.transcribe(audioBlob, participants)
    } else {
      // Mock fallback
      segments = await transcriptionProvider.transcribe(new Blob([]), participants)
    }

    // 5. Save segments
    const segmentsToInsert = segments.map((s, idx) => ({
      meeting_id: meetingId,
      speaker_label: s.speaker_label,
      text: s.text,
      start_ms: s.start_ms,
      end_ms: s.end_ms
    }))

    const { data: savedSegments, error: segError } = await supabase
      .from('transcript_segments')
      .insert(segmentsToInsert)
      .select()

    if (segError) throw new Error('Failed to save segments')

    // Map temp IDs to real IDs
    const segmentMap = new Map<string, string>()
    segments.forEach((s, idx) => {
      if (s.id) segmentMap.set(s.id, savedSegments[idx].id)
    })

    const realSegmentsInput: TranscriptSegmentInput[] = savedSegments.map(s => ({
      id: s.id,
      speaker_label: s.speaker_label,
      text: s.text,
      start_ms: s.start_ms,
      end_ms: s.end_ms
    }))

    // 6. Extract contributions
    const extractionProvider = getExtractionProvider()
    const extractionResult = await extractionProvider.extractContributions(
      realSegmentsInput,
      participants,
      meeting.projects?.name
    )

    let contributionCount = 0
    let commitmentCount = 0
    const employeeSet = new Set<string>()

    const proofProvider = getProofProvider()

    // 7. Process Contributions
    for (const c of extractionResult.contributions) {
      const matchedParticipant = participants.find((p: any) => p.name.toLowerCase().includes(c.employee_name.toLowerCase()))
      if (!matchedParticipant) continue

      const realSegIds = c.evidence_segment_ids.map(id => segmentMap.get(id) || id)

      const { data: insertedC, error: cError } = await supabase.from('contributions').insert({
        profile_id: matchedParticipant.id,
        meeting_id: meetingId,
        project_id: meeting.project_id,
        type: c.type,
        title: c.title,
        description: c.description,
        confidence: c.confidence
      }).select().single()

      if (cError) continue

      contributionCount++
      employeeSet.add(matchedParticipant.id)

      // Anchor proof
      const proof = await proofProvider.anchor(insertedC as any)
      if (proof.hash) {
        await supabase.from('contributions').update({
          proof_hash: proof.hash,
          proof_signature: proof.signature
        }).eq('id', insertedC.id)
      }

      const evidence = realSegIds.map(sid => ({
        contribution_id: insertedC.id,
        segment_id: sid
      }))
      await supabase.from('contribution_evidence').insert(evidence)

      for (const skillName of c.skills) {
        const { data: skill } = await supabase.from('skills').upsert({ name: skillName }, { onConflict: 'name' }).select().single()
        if (skill) {
          await supabase.from('employee_skills').insert({
            profile_id: matchedParticipant.id,
            skill_id: skill.id
          })
        }
      }
    }

    // 8. Commitments
    for (const c of extractionResult.commitments) {
      const matchedParticipant = participants.find((p: any) => p.name.toLowerCase().includes(c.employee_name.toLowerCase()))
      if (!matchedParticipant) continue

      const realSegIds = c.evidence_segment_ids.map(id => segmentMap.get(id) || id)

      await supabase.from('commitments').insert({
        profile_id: matchedParticipant.id,
        meeting_id: meetingId,
        description: c.description,
        status: 'PENDING'
      })
      commitmentCount++
    }

    // 9. Complete
    await supabase.from('meetings').update({ status: 'COMPLETE' }).eq('id', meetingId)

    return NextResponse.json({
      meeting: { ...meeting, status: 'COMPLETE' },
      contribution_count: contributionCount,
      commitment_count: commitmentCount,
      employee_count: employeeSet.size
    })

  } catch (error: any) {
    await supabase.from('meetings').update({ status: 'FAILED' }).eq('id', meetingId)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
