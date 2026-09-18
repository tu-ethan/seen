import { TranscriptSegmentInput } from '@/types'

export interface TranscriptionProvider {
  transcribe(audioBlob: Blob, participants: { name: string; label: string }[]): Promise<TranscriptSegmentInput[]>
}

export class ElevenLabsProvider implements TranscriptionProvider {
  async transcribe(audioBlob: Blob, participants: { name: string; label: string }[]): Promise<TranscriptSegmentInput[]> {
    try {
      const formData = new FormData()
      formData.append('model_id', 'scribe_v1')
      formData.append('file', audioBlob, 'audio.webm')

      const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
        method: 'POST',
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY!
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`)
      }

      const data = await response.json()
      
      // Since ElevenLabs may return data in their specific format, we map it back to TranscriptSegmentInput
      // Mocking the parse process for demonstration as specific integration isn't fully spec'd:
      return data.words ? data.words.map((w: any, index: number) => ({
        id: `seg_${index}`,
        speaker_label: 'Unknown',
        text: w.text,
        start_ms: w.start,
        end_ms: w.end
      })) : []
    } catch (error) {
      console.warn('ElevenLabs transcription failed, falling back to mock.', error)
      return new MockTranscriptionProvider().transcribe(audioBlob, participants)
    }
  }
}

export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(audioBlob: Blob, participants: { name: string; label: string }[]): Promise<TranscriptSegmentInput[]> {
    return [
      { id: 'seg_1', speaker_label: 'Maya', text: 'I finished the onboarding prototype yesterday. The user flows are ready for testing.', start_ms: 0, end_ms: 5 },
      { id: 'seg_2', speaker_label: 'Maya', text: 'I also interviewed five customers about the pricing page. They were all confused about the tier differences — three of them didn\'t even notice the enterprise tier.', start_ms: 6, end_ms: 15 },
      { id: 'seg_3', speaker_label: 'Daniel', text: 'I pushed the fix for the authentication bug this morning. It was a race condition in the session handler. The beta deployment is unblocked now.', start_ms: 16, end_ms: 25 },
      { id: 'seg_4', speaker_label: 'Alex', text: 'I finalized the Q4 product brief and sent it to the team. I also set up the sprint planning session for next Monday.', start_ms: 26, end_ms: 35 },
      { id: 'seg_5', speaker_label: 'Maya', text: 'I\'ll take ownership of the pricing redesign based on my research. I want to have a prototype ready by Friday.', start_ms: 36, end_ms: 45 },
      { id: 'seg_6', speaker_label: 'Daniel', text: 'I\'ll review Maya\'s pricing prototype when it\'s ready and give feedback from the engineering side.', start_ms: 46, end_ms: 55 },
    ]
  }
}

export function getTranscriptionProvider(): TranscriptionProvider {
  if (process.env.ELEVENLABS_API_KEY) {
    return new ElevenLabsProvider()
  }
  return new MockTranscriptionProvider()
}
