'use client'

import Link from 'next/link'
import { ArrowRight, FolderKanban, ShieldCheck, UsersRound } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { JORDAN, PROJECTS, TEAM_MEMBERS } from '@/lib/fixtures'
import { employeeById, formatDate, projectById } from '@/lib/product'

const AVATAR_COLORS = {
  lilac: 'bg-[#8d72d8]/18 text-[#cbbcf2]', rust: 'bg-[#9b4f35]/18 text-[#d8aa98]', blue: 'bg-[#536b91]/20 text-[#b8c9e2]',
  sand: 'bg-[#98784c]/20 text-[#dcc49d]', green: 'bg-[#52796f]/20 text-[#abd0c6]',
}

export default function ManagerTeamPage() {
  const { allVisibleContributions } = useSeen()
  const shared = allVisibleContributions.filter((item) => item.sharedWithManager)

  return (
    <div className="page-shell space-y-10">
      <header className="border-b border-white/[0.08] pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#8d72d8]/15 text-xs font-semibold text-[#c9baf2]">{JORDAN.initials}</span><div><p className="text-sm text-[#d4ccc1]">{JORDAN.name}</p><p className="text-xs text-[#746e66]">{JORDAN.title}</p></div></div>
          <p className="text-xs uppercase tracking-[0.14em] text-[#777169]">Friday, September 18</p>
        </div>
        <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Manager workspace</p><h1 className="mt-3 font-serif text-5xl tracking-[-0.03em] text-[#f4efe6] sm:text-6xl">Mission systems team</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#958e85]">Review the professional records each employee has chosen to share, with source evidence and project context.</p></div>
          <div className="flex items-center gap-2 rounded-full border border-[#52796f]/35 bg-[#52796f]/10 px-4 py-2 text-xs text-[#a6c8c2]"><ShieldCheck size={14} />Employee-controlled records</div>
        </div>
      </header>

      <section>
        <div className="mb-5 flex items-end justify-between gap-4"><div><p className="eyebrow">Shared with Jordan</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">People and current focus</h2></div><p className="hidden text-xs text-[#716a63] sm:block">No rankings or productivity scores</p></div>
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {TEAM_MEMBERS.map((employee) => {
            const work = shared.filter((item) => item.employeeId === employee.id)
            const latest = work[0]
            return (
              <Link key={employee.id} href={`/manager/employees/${employee.id}`} className="panel group flex min-h-[310px] flex-col p-6 transition hover:-translate-y-0.5 hover:border-[#a98cf5]/35">
                <div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${AVATAR_COLORS[employee.accent]}`}>{employee.initials}</span><div><h3 className="text-sm font-medium text-[#ddd5ca]">{employee.name}</h3><p className="mt-0.5 text-xs text-[#777169]">{employee.title}</p></div></div><ArrowRight size={16} className="text-white/20 transition group-hover:text-[#b8a1f4]" /></div>
                <p className="mt-5 text-sm leading-6 text-[#958e85]">{employee.summary}</p>
                <div className="mt-5 flex flex-wrap gap-2">{employee.projectIds.slice(0, 3).map((id) => <span key={id} className="skill-chip">{projectById(id)?.name}</span>)}</div>
                {latest && <div className="mt-auto border-t border-white/[0.07] pt-5"><div className="flex flex-wrap items-center gap-2"><StatusBadge status={latest.status} /><span className="text-[11px] text-[#6e6861]">{formatDate(latest.date)}</span></div><p className="mt-2 line-clamp-2 text-sm text-[#c1b9af]">{latest.title}</p></div>}
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <div className="panel p-6 sm:p-8">
          <div className="flex items-center gap-2"><FolderKanban size={17} className="text-[#b8a1f4]" /><p className="eyebrow">Mission work</p></div>
          <div className="mt-5 space-y-1">{PROJECTS.map((project) => {
            const people = TEAM_MEMBERS.filter((employee) => employee.projectIds.includes(project.id))
            const latest = shared.find((item) => item.projectId === project.id)
            return <div key={project.id} className="grid gap-3 border-b border-white/[0.07] py-4 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[1fr_0.8fr]"><div><p className="text-sm text-[#d8d0c5]">{project.name}</p><p className="mt-1 text-xs text-[#756e66]">{project.shortName}</p></div><div><p className="text-xs text-[#9a9289]">{people.map((person) => person.name.split(' ')[0]).join(', ')}</p>{latest && <p className="mt-1 line-clamp-1 text-xs text-[#6f6962]">Latest: {latest.title}</p>}</div></div>
          })}</div>
        </div>

        <div className="panel p-6 sm:p-8">
          <div className="flex items-center gap-2"><UsersRound size={17} className="text-[#b8a1f4]" /><p className="eyebrow">Recent shared evidence</p></div>
          <div className="mt-4">{shared.slice(0, 6).map((item) => {
            const employee = employeeById(item.employeeId)
            return <Link key={item.id} href={`/manager/employees/${item.employeeId}#${item.id}`} className="group block border-b border-white/[0.07] py-4 last:border-0"><div className="flex items-center justify-between gap-3"><p className="text-xs text-[#756e66]">{employee?.name} · {projectById(item.projectId)?.name}</p><StatusBadge status={item.status} /></div><p className="mt-2 text-sm text-[#c9c0b6] transition group-hover:text-[#e9dfd4]">{item.title}</p></Link>
          })}</div>
        </div>
      </section>

      <footer className="rounded-2xl border border-white/[0.08] px-5 py-4 text-xs leading-5 text-[#716b64]">Seen shows shared work evidence, project context, and skill development. It does not show employee rankings, comparisons, speaking-time metrics, or productivity scores.</footer>
    </div>
  )
}
