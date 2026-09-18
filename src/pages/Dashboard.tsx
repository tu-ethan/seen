import { Link } from 'react-router-dom'
import { ArrowLeft, Globe } from 'lucide-react'

type LogEntry = {
  date: string
  title: string
  highlights: string[]
  skills: string[]
}

type SkillProgress = {
  name: string
  level: number
  note: string
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

const SKILLS: SkillProgress[] = [
  { name: 'Leadership', level: 78, note: '+12% this quarter' },
  { name: 'Systems Design', level: 64, note: '+8% this quarter' },
  { name: 'Communication', level: 85, note: '+5% this quarter' },
  { name: 'Mentorship', level: 70, note: '+15% this quarter' },
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
            <p className="text-white/50 text-sm mb-2">{today}</p>
            <h1
              className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Your record, up to date
            </h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
            <section>
              <h2 className="text-white/70 text-sm font-medium uppercase tracking-wide mb-4">What you worked on</h2>
              <div className="space-y-4">
                {LOG_ENTRIES.map((entry) => (
                  <div key={entry.title} className="liquid-glass rounded-2xl px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white text-lg font-medium">{entry.title}</h3>
                      <span className="text-white/40 text-xs shrink-0 ml-4">{entry.date}</span>
                    </div>
                    <ul className="space-y-1.5 mb-4">
                      {entry.highlights.map((highlight) => (
                        <li key={highlight} className="text-white/70 text-sm leading-relaxed flex gap-2">
                          <span className="text-white/30">—</span>
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-wrap gap-2">
                      {entry.skills.map((skill) => (
                        <span
                          key={skill}
                          className="liquid-glass rounded-full px-3 py-1 text-white/70 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-white/70 text-sm font-medium uppercase tracking-wide mb-4">Skill progress</h2>
              <div className="liquid-glass rounded-2xl px-6 py-5 space-y-6">
                {SKILLS.map((skill) => (
                  <div key={skill.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-medium">{skill.name}</span>
                      <span className="text-white/40 text-xs">{skill.note}</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-white/80"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
