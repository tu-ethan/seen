import Link from 'next/link'
import { Users, Video, TrendingUp, FileText, ChevronRight, Plus, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

const TEAM = [
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Maya Chen',
    initials: 'MC',
    color: 'bg-blue-500/20 text-blue-300',
    title: 'Senior Product Engineer',
    contributions: 15,
    projects: ['Project Nova', 'Project Atlas'],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    name: 'Daniel Park',
    initials: 'DP',
    color: 'bg-emerald-500/20 text-emerald-300',
    title: 'Software Engineer',
    contributions: 9,
    projects: ['Project Atlas', 'Project Orbit'],
  },
  {
    id: 'a0000000-0000-0000-0000-000000000004',
    name: 'Alex Rivera',
    initials: 'AR',
    color: 'bg-amber-500/20 text-amber-300',
    title: 'Product Manager',
    contributions: 8,
    projects: ['Project Nova', 'Project Orbit'],
  },
]

const RECENT_CONTRIBUTIONS = [
  { id: '1', employeeName: 'Maya Chen', employeeInitials: 'MC', employeeColor: 'bg-blue-500/20 text-blue-300', employeeId: 'a0000000-0000-0000-0000-000000000002', type: 'EXECUTION', title: 'Completed onboarding prototype', project: 'Project Atlas', date: 'Sep 18' },
  { id: '2', employeeName: 'Daniel Park', employeeInitials: 'DP', employeeColor: 'bg-emerald-500/20 text-emerald-300', employeeId: 'a0000000-0000-0000-0000-000000000003', type: 'EXECUTION', title: 'Resolved authentication bug blocking beta', project: 'Project Atlas', date: 'Sep 17' },
  { id: '3', employeeName: 'Maya Chen', employeeInitials: 'MC', employeeColor: 'bg-blue-500/20 text-blue-300', employeeId: 'a0000000-0000-0000-0000-000000000002', type: 'RESEARCH', title: 'Conducted pricing page customer interviews', project: 'Project Nova', date: 'Sep 15' },
  { id: '4', employeeName: 'Alex Rivera', employeeInitials: 'AR', employeeColor: 'bg-amber-500/20 text-amber-300', employeeId: 'a0000000-0000-0000-0000-000000000004', type: 'EXECUTION', title: 'Authored Q4 product roadmap brief', project: 'Project Nova', date: 'Sep 14' },
  { id: '5', employeeName: 'Maya Chen', employeeInitials: 'MC', employeeColor: 'bg-blue-500/20 text-blue-300', employeeId: 'a0000000-0000-0000-0000-000000000002', type: 'LEADERSHIP', title: 'Coordinated pricing redesign across teams', project: 'Project Nova', date: 'Sep 12' },
]

const RECENT_MEETINGS = [
  { id: 'demo-meeting-1', title: 'Project Nova Weekly Sync', project: 'Project Nova', date: 'Sep 18, 2026', contributionCount: 7 },
  { id: 'demo-meeting-2', title: 'Atlas Sprint Review', project: 'Project Atlas', date: 'Sep 11, 2026', contributionCount: 5 },
  { id: 'demo-meeting-3', title: 'Q3 Planning Session', project: 'Project Nova', date: 'Sep 4, 2026', contributionCount: 6 },
]

const TYPE_COLORS: Record<string, string> = {
  EXECUTION: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
  RESEARCH: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
  IDEATION: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  OWNERSHIP: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
  COLLABORATION: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  LEADERSHIP: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function ManagerDashboard() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">{getGreeting()}, Jordan.</h1>
          <p className="text-zinc-500 text-sm mt-0.5">{today}</p>
        </div>
        <Link href="/manager/meetings/new" className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={15} /> Start Meeting
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Team Members', value: '3', icon: Users },
          { label: 'Active Projects', value: '3', icon: FileText },
          { label: 'Meetings This Month', value: '8', icon: Video, delta: '+2 vs last month' },
          { label: 'Contributions This Week', value: '12', icon: TrendingUp, delta: '+4 vs last week' },
        ].map(({ label, value, icon: Icon, delta }) => (
          <div key={label} className="rounded-xl border border-[#27272A] bg-[#141416] p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-zinc-500">{label}</span>
              <Icon size={14} className="text-zinc-600" />
            </div>
            <p className="text-2xl font-semibold text-zinc-100">{value}</p>
            {delta && <p className="text-xs text-emerald-400 mt-1">{delta}</p>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Team */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-300">Your Team</h2>
          </div>
          <div className="space-y-2">
            {TEAM.map((member) => (
              <Link key={member.id} href={`/manager/employees/${member.id}`}
                className="flex items-center gap-3 rounded-xl border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] p-4 transition-colors">
                <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', member.color)}>{member.initials}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-200">{member.name}</p>
                  <p className="text-xs text-zinc-500">{member.title}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{member.contributions} contributions</p>
                </div>
                <ChevronRight size={14} className="text-zinc-600 shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="col-span-2 space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-zinc-300">Recent Contributions</h2>
            <div className="rounded-xl border border-[#27272A] bg-[#141416] overflow-hidden">
              {RECENT_CONTRIBUTIONS.map((c, i) => (
                <Link key={c.id} href={`/manager/employees/${c.employeeId}`}
                  className={cn('flex items-center gap-3 px-4 py-3 hover:bg-[#1A1A1D] transition-colors', i < RECENT_CONTRIBUTIONS.length - 1 && 'border-b border-[#1E1E21]')}>
                  <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', c.employeeColor)}>{c.employeeInitials}</div>
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border shrink-0', TYPE_COLORS[c.type])}>{c.type}</span>
                  <p className="text-sm text-zinc-300 flex-1 truncate">{c.title}</p>
                  <span className="text-xs text-zinc-600 shrink-0 hidden xl:block">{c.project}</span>
                  <span className="text-xs text-zinc-600 shrink-0">{c.date}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-300">Recent Meetings</h2>
              <Link href="/manager/meetings" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                View all <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {RECENT_MEETINGS.map((m) => (
                <Link key={m.id} href={`/manager/meetings/${m.id}`}
                  className="flex items-center gap-4 rounded-xl border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] px-4 py-3.5 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200">{m.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{m.project} · {m.date}</p>
                  </div>
                  <span className="text-xs text-zinc-500">{m.contributionCount} contributions</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">COMPLETE</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
