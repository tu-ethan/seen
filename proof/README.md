# Seen product prototype

This directory contains the Ares Frontier product experience for Seen. It is a Next.js prototype focused on Maya Chen, a firmware engineer building systems for Mars missions, with a mock-backed Google Meet path and a demo-only manual Outlook evidence sync.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No live account is required for the prepared product demo. Copy `.env.example` to `.env.local` to make the mock Google configuration explicit. The real Outlook integration remains visibly unavailable until all of its server secrets are configured.

## Product flow

1. Open Maya’s employee home to see her latest contributions and the source evidence behind them.
2. In Connections, connect Google and select the recurring **Weekly Contributions** series. Seen stores its stable Meet space resource and creates a transcript-generated event subscription.
3. In mock mode, use **Simulate transcript ready** to send a realistic Pub/Sub event through the same server workflow used by a live event. Seen fetches speaker-attributed transcript turns, runs strict Gemini extraction, and adds grounded evidence automatically.
4. Open any contribution to edit or delete it. Google Meet evidence is active immediately and has no review gate.
5. Open Projects to see which months contain source-linked contributions for each project, or use Impact to search and filter the evidence record.
6. Open Jordan’s manager workspace to browse the shared records of Maya, Daniel, Priya, Elena, and Alex.

## Outlook evidence pipeline

The real Outlook flow is employee-owned from end to end:

1. The signed-in employee connects their own Microsoft account through authorization-code OAuth with PKCE.
2. Seen requests only `openid profile email offline_access Mail.Read`; it does not use application-wide mail permissions.
3. The employee applies the exact Outlook category `Seen` and clicks **Sync labeled emails now**.
4. That request queries only messages carrying the exact category, skips message IDs already stored, and fetches the minimum message fields for each new result. Attachments are never requested.
5. The body cleaner removes HTML, quoted reply chains, common signatures, tracking links, and obvious tokens, then caps text at 12,000 characters.
6. Gemini receives one cleaned, labeled email and must return schema-valid JSON with an exact excerpt present in that email.
7. Idempotent source and candidate constraints create private `DRAFT` records. Managers can query only `APPROVED` records and never receive a raw email body.

Tokens and minimized source references are encrypted with AES-256-GCM. Full email bodies are not persisted. Provider and model failures are reduced to safe error codes rather than logging raw payloads.

## Outlook environment variables

Use `.env.example` and configure these server-only values:

- `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_TENANT_ID`, and `MICROSOFT_REDIRECT_URI`
- `GEMINI_API_KEY` and optional `GEMINI_MODEL`
- `APP_ENCRYPTION_KEY`: 32 random bytes encoded as base64
- `SEEN_SESSION_SECRET`: long random value used to sign the demo session boundary
- optional `SEEN_DATABASE_PATH` (defaults to `data/seen-proof.db`) and `SEEN_DEMO_MODE`

Never prefix these values with `NEXT_PUBLIC_`; none belongs in browser code.

## Microsoft and deployment setup

Register a web application in Microsoft Entra ID. Add the configured redirect URI, create a client secret, and grant delegated `Mail.Read` plus `openid`, `profile`, `email`, and `offline_access`. Do not grant Microsoft Graph application mail permissions.

No Outlook webhook, Graph subscription, cron job, worker, or queue is required. `POST /api/integrations/outlook/sync` performs the complete manual sync and returns `checked`, `skipped`, `evidenceCreated`, and `failed` counts.

SQLite matches the repository’s local persistence approach. For a fresh database, run `migrations/001_outlook_evidence.sql`. If upgrading from the earlier automated Outlook prototype, also run `migrations/002_manual_outlook_sync.sql` to remove its obsolete subscription and job tables. The app initializes the same simplified schema on first server access. A deployed demo must provide a persistent writable volume for `SEEN_DATABASE_PATH`.

The current prototype has no production identity provider. Demo mode uses Maya’s fixed server identity. Before production, set `SEEN_DEMO_MODE=false` and have the real authentication callback issue the same server-only identity shape (`workspaceId`, `employeeId`, and `role`) in an HTTP-only `seen_session` cookie. The Outlook endpoints reject unauthenticated or wrong-role access in that mode.

## Data and future providers

All people, projects, meetings, skills, and contributions live in `lib/fixtures.ts`. Shared types live in `types/index.ts`, and the product data is exposed consistently through `components/app/SeenProvider.tsx`.

`lib/integrations/contracts.ts` defines the provider boundaries. `lib/integrations/sample.ts` supports the original fixture sync, while `lib/integrations/server/` contains server-only adapters for:

- Microsoft Graph Outlook messages using delegated `Mail.Read` and an exact-category manual sync.
- Google Calendar recurring-series discovery, stable Google Meet space lookup, Workspace Events transcript subscriptions, paginated transcript entries, and participant display-name resolution.
- ElevenLabs Scribe v2 audio transcription with speaker diarization.
- Gemini JSON-schema contribution extraction from either emails or transcripts.

The Google Meet webhook accepts the Pub/Sub CloudEvents protocol binding, is idempotent by event and transcript resource, rejects unsupported event types, and verifies every Gemini quote against the exact transcript speaker and timestamp before saving it. Workspace subscriptions expire, so a production scheduler must renew them before `expiresAt`.

## Verify it

```bash
npm run type-check
npm run lint
npm test
npm run build
```

`npm test` covers the mock Google flow plus Outlook category gating, private draft status, idempotency, tenant/employee ownership, manager privacy, sanitization, and malformed Gemini output.

Future credentials belong in server-side environment configuration only. They must never be exposed in client components or committed to Git.
