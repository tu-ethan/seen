import 'server-only'
import type { OutlookProvider, SourceDocument } from '@/lib/integrations/contracts'
import { cleanEmailBody, isSeenLabeled } from '@/lib/integrations/outlook-domain'

interface GraphMessage {
  id: string
  conversationId?: string
  subject?: string
  receivedDateTime?: string
  sentDateTime?: string
  categories?: string[]
  body?: { contentType?: string; content?: string }
  from?: { emailAddress?: { name?: string; address?: string } }
}

interface GraphMessageList {
  value?: GraphMessage[]
}

export class MicrosoftGraphOutlookProvider implements OutlookProvider {
  constructor(private readonly accessToken: string) {}

  async listRelevantMessages(): Promise<SourceDocument[]> {
    const params = new URLSearchParams({
      '$select': 'id,conversationId,subject,from,receivedDateTime,sentDateTime,categories,body',
      '$filter': "categories/any(category:category eq 'Seen')",
      '$orderby': 'receivedDateTime desc',
      '$top': '50',
    })
    const response = await fetch(`https://graph.microsoft.com/v1.0/me/messages?${params}`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
      cache: 'no-store',
    })
    if (!response.ok) throw new Error(`Microsoft Graph mail request failed with status ${response.status}`)

    const payload = await response.json() as GraphMessageList
    return (payload.value ?? []).filter((message) => isSeenLabeled(message.categories)).map((message) => ({
      id: message.id,
      provider: 'OUTLOOK',
      kind: 'EMAIL',
      title: message.subject || 'Untitled email',
      occurredAt: message.sentDateTime || message.receivedDateTime || new Date(0).toISOString(),
      author: message.from?.emailAddress?.name || message.from?.emailAddress?.address,
      content: cleanEmailBody(message.body?.content ?? '', message.body?.contentType ?? 'text'),
    }))
  }
}
