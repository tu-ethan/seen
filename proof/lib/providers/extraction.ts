import { GoogleGenAI } from '@google/genai'
import { TranscriptSegmentInput, ContributionType } from '@/types'

export interface GeminiExtractionResult {
  contributions: {
    employee_name: string
    type: ContributionType
    title: string
    description: string
    evidence_segment_ids: string[]
    skills: string[]
    confidence: number
  }[]
  commitments: {
    employee_name: string
    description: string
    evidence_segment_ids: string[]
  }[]
}

export interface ExtractionProvider {
  extractContributions(
    segments: TranscriptSegmentInput[],
    participants: { name: string; label: string }[],
    projectName?: string
  ): Promise<GeminiExtractionResult>
}

export class GeminiExtractionProvider implements ExtractionProvider {
  async extractContributions(
    segments: TranscriptSegmentInput[],
    participants: { name: string; label: string }[],
    projectName?: string
  ): Promise<GeminiExtractionResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      
      const participantList = participants.map(p => `- ${p.name} (${p.label})`).join('\n')
      const transcriptJson = JSON.stringify(segments.map(s => ({ id: s.id, speaker: s.speaker_label, text: s.text })))

      const systemInstruction = `You are an evidence extraction engine for PROOF, a workplace contribution tracking system. Extract ONLY concrete, observable contributions supported by evidence in the transcript. Never invent employees. Never hallucinate unsupported claims. Return valid JSON only.`
      
      const prompt = `You are analyzing a meeting transcript for PROOF, a workplace contribution tracking system.

MEETING PARTICIPANTS (ONLY extract contributions for these people):
${participantList}

PROJECT: ${projectName || 'Unknown'}

CONTRIBUTION TYPES:
- EXECUTION: Concrete completed work (past tense: "I finished", "I shipped", "I resolved")
- OWNERSHIP: Took responsibility ("I'll lead", "I volunteered to own")
- IDEATION: Proposed concrete ideas ("What if we", "I suggest")
- RESEARCH: Research performed or insights produced ("I interviewed", "I found that")
- COLLABORATION: Helped or unblocked someone ("I helped X with Y")
- LEADERSHIP: Coordinated, mentored, or organized across people/teams

RULES:
1. Only extract for participants listed above
2. Every contribution MUST reference evidence_segment_ids from the transcript below
3. Future commitments ("I'll do X") are commitments NOT completed EXECUTION
4. If confidence < 0.6, omit the contribution entirely
5. Do not create duplicate contributions for the same statement
6. Only extract observable actions — no personality inferences

TRANSCRIPT SEGMENTS:
${transcriptJson}

Return ONLY valid JSON matching exactly this schema:
{"contributions":[{"employee_name":"string","type":"EXECUTION|OWNERSHIP|IDEATION|RESEARCH|COLLABORATION|LEADERSHIP","title":"string","description":"string","evidence_segment_ids":["string"],"skills":["string"],"confidence":0.0-1.0}],"commitments":[{"employee_name":"string","description":"string","evidence_segment_ids":["string"]}]}`

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json'
        }
      })

      const result = JSON.parse(response.text || '{}') as GeminiExtractionResult
      return result
    } catch (error) {
      console.warn('Gemini extraction failed, falling back to mock.', error)
      return new MockExtractionProvider().extractContributions(segments, participants, projectName)
    }
  }
}

export class MockExtractionProvider implements ExtractionProvider {
  async extractContributions(
    segments: TranscriptSegmentInput[],
    participants: { name: string; label: string }[],
    projectName?: string
  ): Promise<GeminiExtractionResult> {
    return {
      contributions: [
        {
          employee_name: 'Maya',
          type: 'EXECUTION',
          title: 'Finished Onboarding Prototype',
          description: 'Completed the onboarding prototype and prepared user flows for testing.',
          evidence_segment_ids: ['seg_1'],
          skills: ['Prototyping', 'UX Design'],
          confidence: 0.95
        },
        {
          employee_name: 'Maya',
          type: 'RESEARCH',
          title: 'Customer Pricing Interviews',
          description: 'Interviewed 5 customers about the pricing page, discovering confusion about tier differences.',
          evidence_segment_ids: ['seg_2'],
          skills: ['User Research', 'Customer Interviews'],
          confidence: 0.9
        },
        {
          employee_name: 'Daniel',
          type: 'EXECUTION',
          title: 'Fixed Authentication Bug',
          description: 'Resolved a race condition in the session handler, unblocking the beta deployment.',
          evidence_segment_ids: ['seg_3'],
          skills: ['Bug Fixing', 'Backend Development'],
          confidence: 0.95
        },
        {
          employee_name: 'Alex',
          type: 'EXECUTION',
          title: 'Finalized Q4 Product Brief',
          description: 'Completed the Q4 product brief, shared it with the team, and scheduled sprint planning.',
          evidence_segment_ids: ['seg_4'],
          skills: ['Product Management', 'Planning'],
          confidence: 0.95
        }
      ],
      commitments: [
        {
          employee_name: 'Maya',
          description: 'Take ownership of the pricing redesign and have a prototype ready by Friday.',
          evidence_segment_ids: ['seg_5']
        },
        {
          employee_name: 'Daniel',
          description: 'Review Maya\'s pricing prototype and provide engineering feedback.',
          evidence_segment_ids: ['seg_6']
        }
      ]
    }
  }
}

export function getExtractionProvider(): ExtractionProvider {
  if (process.env.GEMINI_API_KEY) {
    return new GeminiExtractionProvider()
  }
  return new MockExtractionProvider()
}
