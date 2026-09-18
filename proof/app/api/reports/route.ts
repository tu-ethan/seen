import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: NextRequest) {
  const { profile_id, period_start, period_end } = await req.json()

  if (!profile_id || !period_start || !period_end) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
  }

  const supabase = createServerClient()
  
  // 1. Get profile
  const { data: profile } = await supabase.from('profiles').select('name').eq('id', profile_id).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  // 2. Fetch contributions
  const { data: contributions, error: contError } = await supabase
    .from('contributions')
    .select('id, type, title, description, projects(name), employee_skills(skills(name))')
    .eq('profile_id', profile_id)
    .gte('occurred_at', period_start)
    .lte('occurred_at', period_end)

  if (contError) return NextResponse.json({ error: contError.message }, { status: 500 })

  if (!contributions || contributions.length === 0) {
    return NextResponse.json({ error: 'No contributions found for this period' }, { status: 400 })
  }

  const formattedConts = contributions.map(c => ({
    id: c.id,
    type: c.type,
    title: c.title,
    description: c.description,
    project: ((c as any).projects?.name) || 'Unknown'
  }))

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    
    const systemInstruction = `You are generating an evidence-backed performance impact report for a workplace contribution tracking system called PROOF. Every statement must be directly supported by the provided evidence. Do not write vague personality assessments. Write specific, evidence-backed statements. Do not rank, score, or compare employees.`
    
    const prompt = `Generate an impact report for ${profile.name} covering ${period_start} to ${period_end}.

EVIDENCE BASE (${contributions.length} contributions):
${JSON.stringify(formattedConts)}

Return JSON matching:
{"major_contributions":[{"statement":"...","contribution_ids":["..."]}],"projects":["project names"],"completed_work":[{"statement":"...","contribution_ids":["..."]}],"collaboration":[{"statement":"...","contribution_ids":["..."]}],"leadership":[{"statement":"...","contribution_ids":["..."]}],"skills_demonstrated":["skill names"],"project_highlights":[{"statement":"...","contribution_ids":["..."]}]}`

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: { systemInstruction, responseMimeType: 'application/json' }
    })

    const reportContent = JSON.parse(response.text || '{}')

    const { data: report, error: reportError } = await supabase.from('impact_reports').insert({
      profile_id,
      period_start,
      period_end,
      content: reportContent
    }).select().single()

    if (reportError) throw reportError

    return NextResponse.json(report)

  } catch (error: any) {
    console.warn('Gemini report generation failed, using fallback', error)

    // Fallback report
    const fallbackReport = {
      major_contributions: [{ statement: 'Completed assigned tasks', contribution_ids: contributions.map(c => c.id) }],
      projects: Array.from(new Set(formattedConts.map(c => c.project))),
      completed_work: [{ statement: `Finished ${contributions.filter(c => c.type === 'EXECUTION').length} tasks`, contribution_ids: [] }],
      collaboration: [],
      leadership: [],
      skills_demonstrated: [],
      project_highlights: []
    }

    const { data: report } = await supabase.from('impact_reports').insert({
      profile_id,
      period_start,
      period_end,
      content: fallbackReport
    }).select().single()

    return NextResponse.json(report)
  }
}
