# Seen product prototype

This directory contains the Ares Frontier product experience for Seen. It is a self-contained, hard-coded Next.js prototype focused on Maya Chen, a firmware engineer building systems for Mars missions.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No accounts, API keys, database, microphone, upload, or environment configuration are required.

## Product flow

1. Open Maya’s employee home to see her latest contributions and the source evidence behind them.
2. Meetings are represented as having synced automatically in the background; there is no recording or confirmation step in the app.
3. Open the yearly timeline to see which projects Maya worked on in each month.
4. Explore project, skill, and review views generated from the same contribution record.
5. Open Jordan’s manager workspace to browse the shared records of Maya, Daniel, Priya, Elena, and Alex.

## Data and future providers

All people, projects, meetings, skills, and contributions live in `lib/fixtures.ts`. Shared types live in `types/index.ts`, and the product data is exposed consistently through `components/app/SeenProvider.tsx`.

`lib/providers/index.ts` defines the three replacement boundaries for a later connected build:

- `CalendarProvider`: prepared meeting today; later Google Calendar read-only sync.
- `TranscriptionProvider`: prepared speaker-aware transcript; later ElevenLabs Scribe v2.
- `ExtractionProvider`: deterministic impact cards; later Gemini structured extraction.

Future credentials belong in server-side environment configuration only. They must never be exposed in client components or committed to Git.
