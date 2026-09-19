# Seen product prototype

This directory contains the Ares Frontier product experience for Seen. It is a Next.js prototype focused on Maya Chen, a firmware engineer building systems for Mars missions, with a mock-backed Google Meet path and a demo-only manual Outlook evidence sync. The product continues to call the mail connection “Outlook,” while its server-side provider is Gmail.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No live account is required for the prepared product demo. Copy `.env.example` to `.env.local` to make the mock Google configuration explicit. The real Outlook integration remains visibly unavailable until all of its server secrets are configured.

## Product flow

1. Open Maya’s employee home to see her latest contributions and the source evidence behind them.
2. In Connections, connect Google and select the recurring **Weekly Contributions** series. Seen stores its stable Meet space resource and creates a transcript-generated event subscription.
3. In mock mode, use **Simulate transcript ready** to send a realistic Pub/Sub event through the same server workflow used by a live event. Seen fetches speaker-attributed transcript turns, runs strict OpenRouter extraction, and adds grounded evidence automatically.
4. Open any contribution to edit or delete it. Google Meet evidence is active immediately and has no review gate.
5. Open Projects to see which months contain source-linked contributions for each project, or use Impact to search and filter the evidence record.
6. Open Jordan’s manager workspace to browse the shared records of Maya, Daniel, Priya, Elena, and Alex.

## Outlook evidence pipeline

The real Outlook flow is employee-owned from end to end:

1. The signed-in employee connects their own Google account through authorization-code OAuth with PKCE and offline access.
2. Seen requests only `openid profile email https://www.googleapis.com/auth/gmail.readonly`; it does not use domain-wide delegation or Gmail write/send permissions.
3. The employee creates and applies the exact Gmail label `Seen`, then clicks **Sync labeled emails now** in the UI labeled Outlook.
4. That request resolves the exact label name to its Gmail label ID, queries only messages carrying that label, skips Gmail message IDs already stored, and fetches only message metadata plus MIME body parts for each new result. Attachment bodies are never fetched.
5. The body cleaner removes HTML, quoted reply chains, common signatures, tracking links, and obvious tokens, then caps text at 12,000 characters.
6. Gemini `generateContent` receives one cleaned, labeled email and must return schema-valid JSON with an exact excerpt present in that email.
7. Idempotent source and candidate constraints create private `DRAFT` records. Managers can query only `APPROVED` records and never receive a raw email body.

Tokens and minimized source references are encrypted with AES-256-GCM. Full email bodies are not persisted. Provider and model failures are reduced to safe error codes rather than logging raw payloads.

## Outlook environment variables

Use `.env.example` and configure these server-only values:

- `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, and `GMAIL_REDIRECT_URI`
- `GEMINI_API_KEY` and optional `GEMINI_MODEL` (defaults to `gemini-3.8-flash`)
- `APP_ENCRYPTION_KEY`: 32 random bytes encoded as base64
- `SEEN_SESSION_SECRET`: long random value used to sign the demo session boundary
- optional `SEEN_DATABASE_PATH` (defaults to `data/seen-proof.db`) and `SEEN_DEMO_MODE`

The separate Google Meet prototype continues to use `OPENROUTER_API_KEY` and optional `OPENROUTER_MODEL`. Never prefix any of these values with `NEXT_PUBLIC_`; none belongs in browser code.

## Gmail and deployment setup

1. In Google Cloud Console, create or select a project and enable the Gmail API.
2. Configure the Google Auth Platform consent screen. For an External app in testing, add the Gmail accounts that will run the demo as test users.
3. Add the scopes `openid`, `profile`, `email`, and `https://www.googleapis.com/auth/gmail.readonly`. Do not add Gmail modify, compose, or send scopes.
4. Create an OAuth client with application type **Web application**.
5. Add `http://localhost:3000/api/integrations/outlook/callback` as an authorized redirect URI for local development. For deployment, add the exact HTTPS version for that host and set it as `GMAIL_REDIRECT_URI`.
6. Copy the OAuth client ID and client secret to `GMAIL_CLIENT_ID` and `GMAIL_CLIENT_SECRET`. A separate Gmail API key is not used for delegated mailbox access.
7. In Gmail, create a user label named exactly `Seen`. Apply it to a sent message before pressing **Sync labeled emails now**.

No Gmail watch, Pub/Sub notification, cron job, worker, or queue is required. `POST /api/integrations/outlook/sync` performs the complete manual sync and returns `checked`, `skipped`, `evidenceCreated`, and `failed` counts.

SQLite matches the repository’s local persistence approach. For a fresh database, run `migrations/001_outlook_evidence.sql`. If upgrading from the earlier automated Outlook prototype, run `migrations/002_manual_outlook_sync.sql` to remove obsolete subscription and job tables, then `migrations/003_gmail_backend.sql` before starting the updated app. The app also detects and renames the legacy provider tables and columns on first server access. Existing Microsoft OAuth tokens are discarded because they cannot authorize Gmail, so employees must connect once through Google after the upgrade. A deployed demo must provide a persistent writable volume for `SEEN_DATABASE_PATH`.

The current prototype has no production identity provider. Demo mode uses Maya’s fixed server identity. Before production, set `SEEN_DEMO_MODE=false` and have the real authentication callback issue the same server-only identity shape (`workspaceId`, `employeeId`, and `role`) in an HTTP-only `seen_session` cookie. The Outlook endpoints reject unauthenticated or wrong-role access in that mode.

## Data and future providers

All people, projects, meetings, skills, and contributions live in `lib/fixtures.ts`. Shared types live in `types/index.ts`, and the product data is exposed consistently through `components/app/SeenProvider.tsx`.

`lib/integrations/contracts.ts` defines the provider boundaries. `lib/integrations/sample.ts` supports the original fixture sync, while `lib/integrations/server/` contains server-only adapters for:

- Gmail messages using delegated `gmail.readonly` and an exact-label manual sync, exposed through the product’s existing Outlook routes and wording.
- Google Calendar recurring-series discovery, stable Google Meet space lookup, Workspace Events transcript subscriptions, paginated transcript entries, and participant display-name resolution.
- ElevenLabs Scribe v2 audio transcription with speaker diarization.
- OpenRouter JSON-schema contribution extraction from either emails or transcripts.

The Google Meet webhook accepts the Pub/Sub CloudEvents protocol binding, is idempotent by event and transcript resource, rejects unsupported event types, and verifies every OpenRouter quote against the exact transcript speaker and timestamp before saving it. Workspace subscriptions expire, so a production scheduler must renew them before `expiresAt`.

## Verify it

```bash
npm run type-check
npm run lint
npm test
npm run build
```

`npm test` covers the mock Google flow plus exact Gmail label gating, private draft status, Gmail message-ID idempotency, tenant/employee ownership, manager privacy, sanitization, and malformed model output.

Future credentials belong in server-side environment configuration only. They must never be exposed in client components or committed to Git.
