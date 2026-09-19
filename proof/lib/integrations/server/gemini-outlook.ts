import 'server-only'
import { parseGeminiCandidates, type OutlookEvidenceCandidate } from '@/lib/integrations/outlook-domain'
import type { OutlookMessage } from './microsoft-graph'

interface GeminiResponse { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }

const prompt = `You are an evidence-extraction service for an employee-owned impact record.

Analyze only the supplied labeled email. Identify direct, evidence-backed contributions made by the connected employee, such as:
- work completed or delivered
- ownership or initiative
- problem solving
- collaboration
- leadership
- research or ideas
- measurable outcomes

Return zero or more proposed contributions. Do not infer performance, rank the employee, fabricate details, or treat routine status language as an accomplishment without direct support.

For every contribution, return:
- type
- concise title
- factual description
- exact evidence excerpt from the email
- confidence from 0 to 1
- source timestamp
- source email subject

Return an empty list when the email does not provide sufficient evidence.`

const responseSchema = {
  type: 'object', required: ['contributions'], properties: {
    contributions: { type: 'array', items: { type: 'object',
      required: ['type', 'title', 'description', 'evidenceExcerpt', 'confidence', 'sourceTimestamp', 'sourceEmailSubject'],
      properties: {
        type: { type: 'string', enum: ['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED'] },
        title: { type: 'string', maxLength: 140 }, description: { type: 'string', maxLength: 1200 },
        evidenceExcerpt: { type: 'string', maxLength: 800 }, confidence: { type: 'number', minimum: 0, maximum: 1 },
        sourceTimestamp: { type: 'string', maxLength: 100 }, sourceEmailSubject: { type: 'string', maxLength: 300 },
      },
    } },
  },
} as const

export class GeminiOutlookEvidenceExtractor {
  constructor(private readonly apiKey = process.env.GEMINI_API_KEY, private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash') {}

  async extract(message: OutlookMessage, cleanedBody: string, employee: { name: string; email: string }): Promise<OutlookEvidenceCandidate[]> {
    if (!this.apiKey) throw new Error('GEMINI_NOT_CONFIGURED')
    const suppliedEmail = {
      employee,
      message: {
        id: message.id,
        subject: message.subject,
        sender: message.sender,
        recipients: message.recipients,
        timestamp: message.timestamp,
        categories: message.categories,
        body: cleanedBody,
      },
    }
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.apiKey },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}\n\nSupplied labeled email:\n${JSON.stringify(suppliedEmail)}` }] }],
        generationConfig: { responseMimeType: 'application/json', responseJsonSchema: responseSchema, temperature: 0 },
      }),
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`GEMINI_${response.status}`)
    const payload = await response.json() as GeminiResponse
    const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('')
    if (!text) throw new Error('GEMINI_EMPTY_RESPONSE')
    let parsed: unknown
    try { parsed = JSON.parse(text) } catch { throw new Error('GEMINI_MALFORMED_RESPONSE') }
    const candidates = parseGeminiCandidates(parsed, cleanedBody)
    if (!candidates) throw new Error('GEMINI_SCHEMA_MISMATCH')
    return candidates
  }
}
