'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, ChevronDown, MapPin, ShieldCheck } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { TEAM_MEMBERS } from '@/lib/fixtures'
import { buildSkillRecords, formatDate, projectById } from '@/lib/product'

const AVATAR_COLORS = {
  lilac: 'bg-[#8d72d8]/18 text-[#cbbcf2]', rust: 'bg-[#9b4f35]/18 text-[#d8aa98]', blue: 'bg-[#536b91]/20 text-[#b8c9e2]',
  sand: 'bg-[#98784c]/20 text-[#dcc49d]', green: 'bg-[#52796f]/20 text-[#abd0c6]',
}

export default function ManagerEmployeeRecordPage() {
  const { id } = useParams<{ id: string }>()
  const { allVisibleContributions } = useSeen()
  const employee = TEAM_MEMBERS.find((person) => person.id === id)

  if (!employee) return <div className="page-shell"><div className="panel p-8"><h1 className="font-serif text-3xl">Employee record not found</h1><Link href="/manager" className="secondary-button mt-5">Return to team</Link></div></div>

  const contributions = allVisibleContributions.filter((item) => item.employeeId === employee.id && item.sharedWithManager)
  const skills = buildSkillRecords(contributions)

  return (
    <div className="page-shell space-y-8">
      <Link href="/manager" className="inline-flex items-center gap-2 text-sm text-[#8e877f] transition hover:text-[#c6b5f2]"><ArrowLeft size={15} />Mission systems team</Link>

      <header className="topography relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#141311] p-7 sm:p-10">
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-base font-semibold ${AVATAR_COLORS[employee.accent]}`}>{employee.initials}</span>
            <div><p className="eyebrow">Shared professional record</p><h1 className="mt-2 font-serif text-4xl text-[#f4efe6] sm:text-5xl">{employee.name}</h1><p className="mt-2 text-[#9c948b]">{employee.title} · Ares Frontier</p><p className="mt-2 flex items-center gap-1.5 text-xs text-[#716a63]"><MapPin size={12} />{employee.location}</p></div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#52796f]/35 bg-[#52796f]/10 px-4 py-2 text-xs text-[#a6c8c2]"><ShieldCheck size={14} />Shared by {employee.name.split(' ')[0]}</div>
        </div>
        <p className="relative mt-7 max-w-3xl text-sm leading-7 text-[#aaa198]">{employee.summary}</p>
      </header>

      <section className="rounded-[28px] border border-[#8d72d8]/20 bg-[#8d72d8]/[0.055] p-7 sm:p-9">
        <p className="eyebrow text-[#b5a4df]">2026 review brief</p>
        <p className="mt-4 max-w-5xl font-serif text-2xl leading-9 text-[#e9e0d5]">{employee.reviewSummary}</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="panel p-6">
          <p className="eyebrow">Current projects</p>
          <div className="mt-4 space-y-3">{employee.projectIds.map((projectId) => {
            const project = projectById(projectId)
            const latest = contributions.find((item) => item.projectId === projectId)
            return <div key={projectId} className="rounded-xl border border-white/[0.07] bg-black/10 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[#d4ccc1]">{project?.name}</p><p className="mt-1 text-xs text-[#777169]">{project?.shortName}</p></div><span className="text-[11px] text-[#817a72]">{project?.status}</span></div>{latest && <p className="mt-3 text-xs leading-5 text-[#8d867e]">Latest: {latest.title}</p>}</div>
          })}</div>
        </div>

        <div className="panel p-6">
          <p className="eyebrow">Skills demonstrated</p>
          <p className="mt-3 text-sm leading-6 text-[#8f887f]">Supported by distinct meeting evidence rather than proficiency scores.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{skills.map((skill) => <div key={skill.name} className="rounded-xl border border-white/[0.07] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[#d5cdc2]">{skill.name}</p><span className="text-[11px] text-[#716a63]">{skill.meetingCount} {skill.meetingCount === 1 ? 'meeting' : 'meetings'}</span></div><p className="mt-2 text-xs leading-5 text-[#817a72]">{skill.narrative}</p></div>)}</div>
        </div>
      </section>

      <section>
        <p className="eyebrow">Evidence-backed contributions</p>
        <h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Work shared with Jordan</h2>
        <div className="mt-5 space-y-3">{contributions.map((item) => (
          <details key={item.id} id={item.id} className="panel group p-5 open:border-[#a98cf5]/25">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-5"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge status={item.status} /><span className="text-xs text-[#6f6962]">{projectById(item.projectId)?.name} · {formatDate(item.date)}</span></div><h3 className="mt-3 font-serif text-xl text-[#e5ddd2]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#958e85]">{item.description}</p></div><ChevronDown size={16} className="mt-2 shrink-0 text-[#756e66] transition group-open:rotate-180" /></summary>
            <div className="mt-5 border-t border-white/[0.07] pt-5"><p className="eyebrow">Source evidence</p>{item.evidence.map((evidence) => <blockquote key={evidence.timestamp} className="mt-3 border-l-2 border-[#8d72d8]/45 pl-4 font-serif text-lg leading-7 text-[#cfc5b9]">“{evidence.quote}”<footer className="mt-2 font-sans text-xs text-[#716a63]">{evidence.timestamp} · {evidence.speaker}</footer></blockquote>)}<div className="mt-4 flex flex-wrap gap-2">{item.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div></div>
          </details>
        ))}</div>
      </section>

      <footer className="rounded-2xl border border-white/[0.08] px-5 py-4 text-xs leading-5 text-[#716b64]">This page contains only the record {employee.name} has shared. It does not include comparison, ranking, speaking-time, or productivity data.</footer>
    </div>
  )
}
