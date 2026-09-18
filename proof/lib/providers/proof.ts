import { Contribution } from '@/types'

export interface ProofProvider {
  anchor(contribution: Contribution): Promise<{ hash: string; signature: string | null }>
}

export class DefaultProofProvider implements ProofProvider {
  async anchor(contribution: Contribution): Promise<{ hash: string; signature: string | null }> {
    const dataToHash = {
      contribution_id: contribution.id,
      profile_id: contribution.profile_id,
      meeting_id: contribution.meeting_id,
      type: contribution.type,
      title: contribution.title,
      occurred_at: contribution.occurred_at
    }

    const jsonString = JSON.stringify(dataToHash)
    const encoder = new TextEncoder()
    const data = encoder.encode(jsonString)
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    let signature = null

    if (process.env.SOLANA_PRIVATE_KEY) {
      try {
        // Pseudo-implementation for Solana anchor
        // This is where you would send a memo transaction
        signature = 'mock-signature-' + hashHex.substring(0, 8)
      } catch (err) {
        console.warn('Failed to anchor on Solana', err)
      }
    }

    return { hash: hashHex, signature }
  }
}

export function getProofProvider(): ProofProvider {
  return new DefaultProofProvider()
}
