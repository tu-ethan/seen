# Seen

Seen turns weekly meeting recordings into an evidence-based impact timeline. ElevenLabs Scribe v2 transcribes and separates speakers; Gemini extracts grounded highlights and demonstrated skills; SQLite stores each dated meeting record locally.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Add `ELEVENLABS_API_KEY` and `GEMINI_API_KEY` to `.env.local`.
3. Run `npm run dev`.
4. Open the Vite URL and visit `/dashboard`.

The browser never receives either API key. Uploaded audio/video is sent to ElevenLabs for transcription and is not written to the local database. The database file is created at `data/seen.db` and is ignored by Git.
