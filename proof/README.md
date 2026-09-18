# PROOF — Workplace Contribution Memory

> AI-powered meeting transcription + contribution extraction. Evidence-backed performance reviews.

## What it does

PROOF runs during team meetings, transcribes what people say, identifies concrete employee contributions, and builds a longitudinal record of each person's work — so nothing gets forgotten at performance review time.

**Demo flow:**
1. Manager logs in → starts a meeting
2. Team talks for 30–60 seconds
3. ElevenLabs transcribes audio → Gemini extracts contributions
4. Manager opens an employee profile → contributions already appear
5. Click any contribution → see the original transcript evidence
6. "Generate Impact Report" → Gemini writes an evidence-backed summary

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Auth | Auth0 |
| Database | Supabase (PostgreSQL + RLS) |
| Transcription | ElevenLabs Speech-to-Text |
| AI Extraction | Google Gemini API |
| Optional | Solana Devnet (contribution hash anchoring) |

## Setup

```bash
cd proof
cp .env.example .env.local
# Fill in your keys
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Required environment variables

```
AUTH0_SECRET          # 32+ random chars
AUTH0_BASE_URL        # http://localhost:3000
AUTH0_ISSUER_BASE_URL # https://your-tenant.auth0.com
AUTH0_CLIENT_ID
AUTH0_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
ELEVENLABS_API_KEY
```

### Database setup

```bash
# Run the migration in Supabase SQL editor
cat supabase/migrations/001_initial_schema.sql

# Seed demo data
cat supabase/seed.sql
```

### Demo mode (no Auth0 required)

Open `http://localhost:3000/login` and click any demo user button. Sets a cookie that bypasses Auth0.

### Demo users

| User | Email | Role |
|---|---|---|
| Jordan Lee | manager@proof.demo | Manager |
| Maya Chen | maya@proof.demo | Employee |
| Daniel Park | daniel@proof.demo | Employee |
| Alex Rivera | alex@proof.demo | Employee |

## Architecture

```
proof/
├── app/
│   ├── (auth)/login/          # Login page with demo access
│   ├── (dashboard)/
│   │   ├── manager/           # Manager dashboard, team, meetings, employee profiles
│   │   └── employee/          # Employee self-view
│   └── api/
│       ├── auth/[auth0]/      # Auth0 handler
│       ├── meetings/          # CRUD + processing pipeline
│       ├── contributions/     # Evidence-backed contribution records
│       └── reports/           # Gemini impact report generation
├── components/
│   ├── layout/Sidebar         # Role-aware navigation
│   ├── dashboard/             # ContributionCard, EvidenceDrawer
│   └── meeting/               # MeetingRecorder, ProcessingView
├── lib/
│   ├── providers/             # TranscriptionProvider, ExtractionProvider, ProofProvider
│   └── supabase/              # Client + server Supabase clients
├── supabase/
│   ├── migrations/            # Schema with RLS
│   └── seed.sql               # 3 months of demo data
└── types/                     # Shared TypeScript types
```

## Key design decisions

- **Evidence first**: every contribution has a traceable source (transcript segment)
- **No ranking**: PROOF shows evidence, humans make decisions
- **Demo fallback**: if ElevenLabs or Gemini fails, mock providers return realistic data
- **Contribution types**: EXECUTION · OWNERSHIP · IDEATION · RESEARCH · COLLABORATION · LEADERSHIP
- **Solana optional**: hashes (never raw text) can be anchored on Devnet for verification

## Contribution types

| Type | Example |
|---|---|
| EXECUTION | "I shipped the onboarding redesign yesterday." |
| OWNERSHIP | "I'll own the pricing page from here." |
| IDEATION | "What if we added a tier recommendation quiz?" |
| RESEARCH | "I interviewed 5 customers and found pricing confusion." |
| COLLABORATION | "I helped Daniel debug the session handler." |
| LEADERSHIP | "I coordinated the launch across design and engineering." |
