import { Link } from 'react-router-dom'
import { ArrowLeft, Globe } from 'lucide-react'

type LogEntry = {
  date: string
  title: string
  highlights: string[]
  skills: string[]
}

type Milestone = {
  label: string
  date: string
  reached: boolean
}

const LOG_ENTRIES: LogEntry[] = [
  {
    date: 'Sep 15, 2026',
    title: 'Led Q3 migration rollout',
    highlights: [
      'Owned the cutover plan across 3 teams with zero downtime',
      'Wrote the rollback runbook the on-call team now uses by default',
    ],
    skills: ['Leadership', 'Systems Design'],
  },
  {
    date: 'Sep 10, 2026',
    title: 'Shipped onboarding redesign',
    highlights: [
      'Cut new-user time-to-first-value from 6 minutes to 90 seconds',
      'Partnered with design on 4 rounds of user testing',
    ],
    skills: ['Product Sense', 'Cross-team Collaboration'],
  },
  {
    date: 'Sep 3, 2026',
    title: 'Mentored two junior engineers',
    highlights: [
      'Ran weekly pairing sessions on the payments service',
      'Both mentees shipped their first production PR this cycle',
    ],
    skills: ['Mentorship', 'Communication'],
  },
]

const MILESTONES: Milestone[] = [
  { label: 'Joined team', date: 'Jan 2026', reached: true },
  { label: 'First project shipped', date: 'Mar 2026', reached: true },
  { label: 'Led cross-team initiative', date: 'Jun 2026', reached: true },
  { label: 'Mentored junior engineers', date: 'Aug 2026', reached: true },
  { label: 'Promotion review', date: 'Oct 2026', reached: false },
]

function Dashboard() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <nav className="relative z-20 pl-6 pr-6 py-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white">
              <Globe size={24} />
              <span className="font-semibold text-lg">Seen</span>
            </div>
          </div>
          <Link
            to="/"
            className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
            Back home
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-white/60 text-base mb-2">{today}</p>
            <h1
              className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Your record, up to date
            </h1>
          </div>

          <section className="liquid-glass rounded-2xl overflow-hidden mb-10">
            <div className="grid grid-cols-[10rem_1fr_15rem] text-white/60 text-sm font-semibold uppercase tracking-wide border-b border-white/10">
              <div className="px-6 py-4 border-r border-white/10">Date</div>
              <div className="px-6 py-4 border-r border-white/10">What you worked on</div>
              <div className="px-6 py-4">Skills</div>
            </div>
            {LOG_ENTRIES.map((entry, i) => (
              <div
                key={entry.title}
                className={`grid grid-cols-[10rem_1fr_15rem] ${
                  i !== LOG_ENTRIES.length - 1 ? 'border-b border-white/10' : ''
                }`}
              >
                <div className="px-6 py-6 border-r border-white/10 text-white/70 text-base">{entry.date}</div>
                <div className="px-6 py-6 border-r border-white/10 min-w-0">
                  <p className="text-white text-lg font-semibold mb-3">{entry.title}</p>
                  <ul className="space-y-1.5">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="text-white/75 text-base leading-relaxed flex gap-2">
                        <span className="text-white/40 shrink-0">—</span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="px-6 py-6 flex flex-col gap-2.5 items-start min-w-0">
                  {entry.skills.map((skill) => (
                    <span
                      key={skill}
                      className="liquid-glass rounded-full px-4 py-1.5 text-white/85 text-sm font-medium max-w-full truncate"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-white/80 text-base font-semibold uppercase tracking-wide mb-6">Progress</h2>
            <div className="liquid-glass rounded-2xl px-8 py-10">
              <div className="relative flex items-start justify-between">
                <div className="absolute top-[11px] left-0 right-0 h-px bg-white/15" />
                {MILESTONES.map((milestone) => (
                  <div key={milestone.label} className="relative flex flex-col items-center text-center flex-1 px-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full mb-4 ${
                        milestone.reached ? 'bg-white' : 'bg-white/20 border border-white/40'
                      }`}
                    />
                    <p className={`text-base font-semibold mb-1 ${milestone.reached ? 'text-white' : 'text-white/50'}`}>
                      {milestone.label}
                    </p>
                    <p className="text-white/50 text-sm">{milestone.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
