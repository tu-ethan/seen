import 'server-only'
import type { TranscriptResult, TranscriptionProvider } from '@/lib/integrations/contracts'
import type { TranscriptTurn } from '@/types'

interface ScribeWord {
  text?: string
  start?: number
  end?: number
  type?: string
  speaker_id?: string
}

interface ScribeResponse {
  text?: string
  language_code?: string
  words?: ScribeWord[]
}

function wordsToTurns(words: ScribeWord[]): TranscriptTurn[] {
  const turns: TranscriptTurn[] = []
  for (const word of words.filter((item) => item.type !== 'audio_event' && item.text)) {
    const speakerId = word.speaker_id ?? 'speaker-unknown'
    const previous = turns.at(-1)
    if (!previous || previous.speakerId !== speakerId) {
      turns.push({
        speakerId,
        speakerName: speakerId.replace(/^speaker[_-]?/i, 'Speaker '),
        startMs: Math.round((word.start ?? 0) * 1000),
        endMs: Math.round((word.end ?? word.start ?? 0) * 1000),
        text: word.text ?? '',
      })
      continue
    }
    previous.text += word.text ?? ''
    previous.endMs = Math.round((word.end ?? word.start ?? previous.endMs / 1000) * 1000)
  }
  return turns.map((turn) => ({ ...turn, text: turn.text.trim() }))
}

export class ElevenLabsScribeProvider implements TranscriptionProvider {
  constructor(private readonly apiKey = process.env.ELEVENLABS_API_KEY) {}

  async transcribeAudio(audio: Blob, fileName = 'meeting-audio.webm'): Promise<TranscriptResult> {
    if (!this.apiKey) throw new Error('ELEVENLABS_API_KEY is required to transcribe live meeting audio')
    const form = new FormData()
    form.append('file', audio, fileName)
    form.append('model_id', 'scribe_v2')
    form.append('diarize', 'true')

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': this.apiKey },
      body: form,
    })
    if (!response.ok) throw new Error(`ElevenLabs transcription failed with status ${response.status}`)

    const payload = await response.json() as ScribeResponse
    return {
      languageCode: payload.language_code,
      text: payload.text ?? '',
      turns: wordsToTurns(payload.words ?? []),
    }
  }
}
