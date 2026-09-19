export interface GmailHeader {
  name?: string
  value?: string
}

export interface GmailMessagePart {
  mimeType?: string
  filename?: string
  headers?: GmailHeader[]
  body?: { data?: string; attachmentId?: string }
  parts?: GmailMessagePart[]
}

export interface GmailMessagePayload {
  id?: string
  labelIds?: string[]
  internalDate?: string
  payload?: GmailMessagePart
}

export interface GmailMessage {
  id: string
  subject: string
  sender: string
  recipients: string[]
  timestamp: string
  labels: string[]
  body: string
  contentType: 'html' | 'text'
}

function header(part: GmailMessagePart | undefined, name: string) {
  return part?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())?.value?.trim() ?? ''
}

function decodeBody(data: string | undefined) {
  if (!data) return ''
  const normalized = data.replace(/-/g, '+').replace(/_/g, '/')
  return Buffer.from(normalized, 'base64').toString('utf8')
}

function collectTextParts(part: GmailMessagePart | undefined, output: { plain: string[]; html: string[] }) {
  if (!part || part.filename || part.body?.attachmentId) return
  const decoded = decodeBody(part.body?.data)
  if (decoded && part.mimeType === 'text/plain') output.plain.push(decoded)
  if (decoded && part.mimeType === 'text/html') output.html.push(decoded)
  for (const child of part.parts ?? []) collectTextParts(child, output)
}

export function parseGmailMessage(message: GmailMessagePayload, seenLabelId: string, seenLabelName = 'Seen'): GmailMessage {
  if (!message.id) throw new Error('GMAIL_MESSAGE_INVALID')
  const textParts = { plain: [] as string[], html: [] as string[] }
  collectTextParts(message.payload, textParts)
  const usePlainText = textParts.plain.length > 0
  const timestampNumber = Number(message.internalDate)
  const headerDate = Date.parse(header(message.payload, 'Date'))
  const timestamp = Number.isFinite(timestampNumber) && timestampNumber > 0
    ? new Date(timestampNumber).toISOString()
    : Number.isFinite(headerDate) ? new Date(headerDate).toISOString() : new Date(0).toISOString()
  return {
    id: message.id,
    subject: header(message.payload, 'Subject') || 'Untitled email',
    sender: header(message.payload, 'From'),
    recipients: [header(message.payload, 'To'), header(message.payload, 'Cc')].filter(Boolean),
    timestamp,
    labels: message.labelIds?.includes(seenLabelId) ? [seenLabelName] : [],
    body: (usePlainText ? textParts.plain : textParts.html).join('\n\n'),
    contentType: usePlainText ? 'text' : 'html',
  }
}
