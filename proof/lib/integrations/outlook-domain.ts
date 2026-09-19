export const GMAIL_LABEL = 'Seen'
export const MAX_EMAIL_TEXT_LENGTH = 12_000

export interface OutlookEvidenceCandidate {
  type: 'IMPROVED' | 'SHIPPED' | 'UNBLOCKED' | 'RESEARCHED' | 'MENTORED' | 'LED'
  title: string
  description: string
  evidenceExcerpt: string
  confidence: number
  sourceTimestamp: string
  sourceEmailSubject: string
}

const allowedTypes = new Set<OutlookEvidenceCandidate['type']>(['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED'])

export function isSeenLabeled(labels: readonly string[] | undefined) {
  return labels?.includes(GMAIL_LABEL) === true
}

function decodeEntities(value: string) {
  const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
  return value.replace(/&(#\d+|#x[\da-f]+|amp|lt|gt|quot|apos|nbsp);/gi, (match, entity: string) => {
    if (entity[0] === '#') {
      const hex = entity[1]?.toLowerCase() === 'x'
      const number = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
      return Number.isFinite(number) ? String.fromCodePoint(number) : match
    }
    return entities[entity.toLowerCase()] ?? match
  })
}

export function cleanEmailBody(body: string, contentType: 'html' | 'text' | string = 'text') {
  let value = body
  if (contentType.toLowerCase() === 'html') {
    value = value
      .replace(/<(script|style|head)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<img\b[^>]*>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>|<\/div>|<\/li>|<\/tr>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
    value = decodeEntities(value)
  }

  const lines = value.replace(/\r\n?/g, '\n').split('\n')
  const kept: string[] = []
  for (const line of lines) {
    const trimmed = line.trim()
    if (/^(from|sent|to|cc|subject):\s/i.test(trimmed) && kept.length > 0) break
    if (/^on .+wrote:$/i.test(trimmed) || /^-{2,}\s*original message\s*-{2,}$/i.test(trimmed)) break
    if (/^>/.test(trimmed)) continue
    if (/^(best|regards|kind regards|thanks|thank you|sincerely)[,!]?$/i.test(trimmed)) break
    kept.push(line)
  }

  return kept.join('\n')
    .replace(/https?:\/\/[^\s]*(?:utm_[^\s]*|track|pixel)[^\s]*/gi, '[tracking link removed]')
    .replace(/\b(?:sk-[A-Za-z0-9_-]{16,}|AIza[A-Za-z0-9_-]{20,}|Bearer\s+[A-Za-z0-9._-]{16,})\b/g, '[secret removed]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[token removed]')
    .replace(/\b(?:password|passwd|api[_ -]?key|secret)\s*[:=]\s*\S+/gi, '$1: [removed]')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EMAIL_TEXT_LENGTH)
}

function boundedString(value: unknown, max: number) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

export function parseGeminiCandidates(value: unknown, sourceText: string): OutlookEvidenceCandidate[] | null {
  if (!value || typeof value !== 'object') return null
  const root = value as Record<string, unknown>
  if (!Array.isArray(root.contributions)) return null
  const candidates: OutlookEvidenceCandidate[] = []
  for (const raw of root.contributions) {
    if (!raw || typeof raw !== 'object') return null
    const item = raw as Record<string, unknown>
    if (!allowedTypes.has(item.type as OutlookEvidenceCandidate['type'])) return null
    if (!boundedString(item.title, 140) || !boundedString(item.description, 1_200) || !boundedString(item.evidenceExcerpt, 800)) return null
    if (!boundedString(item.sourceTimestamp, 100) || !boundedString(item.sourceEmailSubject, 300)) return null
    if (typeof item.confidence !== 'number' || !Number.isFinite(item.confidence) || item.confidence < 0 || item.confidence > 1) return null
    const excerpt = String(item.evidenceExcerpt).trim()
    if (!sourceText.includes(excerpt)) return null
    candidates.push({
      type: item.type as OutlookEvidenceCandidate['type'],
      title: String(item.title).trim(),
      description: String(item.description).trim(),
      evidenceExcerpt: excerpt,
      confidence: item.confidence,
      sourceTimestamp: String(item.sourceTimestamp).trim(),
      sourceEmailSubject: String(item.sourceEmailSubject).trim(),
    })
  }
  return candidates
}

export function employeeCanAccessSource(identity: { workspaceId: string; employeeId: string }, source: { workspaceId: string; employeeId: string }) {
  return identity.workspaceId === source.workspaceId && identity.employeeId === source.employeeId
}

export function managerContributionProjection(input: { status: string; title: string; description: string; evidenceExcerpt: string; rawBody?: string }) {
  if (input.status !== 'APPROVED') return null
  return { title: input.title, description: input.description, evidenceExcerpt: input.evidenceExcerpt }
}
