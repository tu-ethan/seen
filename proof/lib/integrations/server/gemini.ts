import 'server-only'
import { MOCK_GEMINI_CONTRIBUTIONS } from '@/lib/integrations/mock-data'
import type { ExtractedContribution, ExtractionProvider, SourceDocument } from '@/lib/integrations/contracts'
import type { ContributionCategory } from '@/types'

interface GeminiResponse { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }

interface GeminiContribution {
  employee: string
  contributionType: ContributionCategory
  title: string
  description: string
  exactSupportingQuote: string
  speaker: string
  timestamp: string
}

const contributionSchema = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['employee', 'contributionType', 'title', 'description', 'exactSupportingQuote', 'speaker', 'timestamp'],
    properties: {
      employee: { type: 'string', description: 'Full name of the employee who made the contribution.' },
      contributionType: { type: 'string', enum: ['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED'] },
      title: { type: 'string', description: 'A concise, factual title.' },
      description: { type: 'string', description: 'One sentence describing the concrete work and outcome.' },
      exactSupportingQuote: { type: 'string', description: 'A verbatim, contiguous quote from one transcript turn.' },
      speaker: { type: 'string', description: 'The exact speaker name attached to the quoted transcript turn.' },
      timestamp: { type: 'string', description: 'The MM:SS timestamp attached to the quoted transcript turn.' },
    },
  },
} as const

function isGeminiContribution(value: unknown): value is GeminiContribution {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.employee === 'string'
    && typeof item.title === 'string'
    && typeof item.description === 'string'
    && typeof item.exactSupportingQuote === 'string'
    && typeof item.speaker === 'string'
    && /^\d{2,}:\d{2}$/.test(String(item.timestamp))
    && ['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED'].includes(String(item.contributionType))
}

export function buildStrictExtractionPrompt(documents: SourceDocument[], employeeNames: string) {
  return [
    'You extract evidence-backed employee contributions from meeting transcripts.',
    `Only include concrete contributions made by these known employees: ${employeeNames}. Set employee to the exact matching full name.`,
    'Do not attribute one person’s work to another person, even when a speaker reports a teammate’s result.',
    'Return a JSON array. Every object must contain exactly these fields: employee, contributionType, title, description, exactSupportingQuote, speaker, timestamp.',
    'Rules:',
    '- Only include completed work, a concrete improvement, an unblock, research with a stated decision, mentoring, or leadership with an owned outcome.',
    '- Never infer productivity, impact, sentiment, speaking time, or work not explicitly supported by the transcript.',
    '- exactSupportingQuote must be one verbatim, contiguous quote copied from a single transcript turn. Do not paraphrase it.',
    '- speaker and timestamp must exactly match that transcript turn.',
    '- If the transcript contains no supported contribution by the employee, return [].',
    'Allowed contributionType values: IMPROVED, SHIPPED, UNBLOCKED, RESEARCHED, MENTORED, LED.',
    'Transcript documents:',
    JSON.stringify(documents),
  ].join('\n\n')
}

export class GeminiExtractionProvider implements ExtractionProvider {
  constructor(
    private readonly apiKey = process.env.GEMINI_API_KEY,
    private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async extractContributions(documents: SourceDocument[], employeeName: string): Promise<ExtractedContribution[]> {
    if (!documents.length) return []
    if (!this.apiKey || this.apiKey.startsWith('mock-')) {
      return structuredClone(MOCK_GEMINI_CONTRIBUTIONS).map((item) => ({ ...item, sourceId: documents[0].id }))
    }

    const response = await this.fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildStrictExtractionPrompt(documents, employeeName) }] }],
        generationConfig: { responseMimeType: 'application/json', responseJsonSchema: contributionSchema, temperature: 0 },
      }),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Gemini extraction failed with status ${response.status}`)

    const payload = await response.json() as GeminiResponse
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')
    if (!text) throw new Error('Gemini returned no structured contribution data')
    const parsed: unknown = JSON.parse(text)
    if (!Array.isArray(parsed) || !parsed.every(isGeminiContribution)) {
      throw new Error('Gemini returned contribution data that did not match the strict schema')
    }
    return parsed.map((item) => ({ ...item, sourceId: documents[0].id }))
  }
}
