'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CalendarCheck, Clock3, Mail, Video } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import { categoryLabel } from '@/components/dashboard/ContributionCard'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import { MAYA, PROJECTS } from '@/lib/fixtures'
import { contributionSource, daysAgoLabel, projectById, sourceProviderLabel } from '@/lib/product'

export default function EmployeeDashboard() {
  const { visibleContributions, skills } = useSeen()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = visibleContributions.find((item) => item.id === selectedId) ?? null
  const recent = visibleContributions.slice(0, 8)

  return (
    <div className="page-shell space-y-10">
      <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Saturday, September 19</p>
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#f4efe6] sm:text-5xl">Good morning, {MAYA.name.split(' ')[0]}.</h1>
          <p className="mt-3 text-sm text-[#8f887f]">Here is the work Seen has added to your record.</p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-[#52796f]/30 bg-[#52796f]/[0.08] px-4 py-2 text-xs text-[#a7c9c0]"><CalendarCheck size={14} />Up to date · Sources sync in the background</div>
      </header>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Your evidence</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Recent contributions</h2><p className="mt-2 text-sm text-[#817a72]">Specific work captured from meetings and Outlook, organized in one record.</p></div>
          <Link href="/employee/projects" className="flex items-center gap-1 text-sm text-[#a99e91] transition hover:text-[#c6b5f2]">See yearly timeline<ArrowRight size={15} /></Link>
        </div>

        <div className="panel overflow-hidden">
          {recent.map((item) => {
            const source = contributionSource(item)
            const SourceIcon = source.provider === 'OUTLOOK' ? Mail : Video
            return (
              <button key={item.id} onClick={() => setSelectedId(item.id)} className="group grid w-full gap-4 border-b border-white/[0.07] px-5 py-5 text-left transition last:border-0 hover:bg-white/[0.025] sm:grid-cols-[minmax(0,1fr)_auto] sm:px-7">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#8d72d8]/30 bg-[#8d72d8]/[0.08] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#c9baf2]">{categoryLabel(item.category)}</span>
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-[#777169]"><SourceIcon size={12} />{sourceProviderLabel(item)}</span>
                    <span className="text-[11px] text-[#5f5a54]">{projectById(item.projectId)?.name}</span>
                  </span>
                  <span className="mt-3 block font-serif text-xl text-[#e9e1d6] transition group-hover:text-[#f5efe7]">{item.title}</span>
                  <span className="mt-2 block text-sm leading-6 text-[#999188]">{item.description}</span>
                  <span className="mt-3 block border-l border-[#8d72d8]/35 pl-3 text-xs leading-5 text-[#7d766e]">“{item.evidence[0].quote}”</span>
                </span>
                <span className="flex items-center gap-1.5 self-start whitespace-nowrap text-xs text-[#746d65]"><Clock3 size={12} />{daysAgoLabel(item.date)}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Mission work</p><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Projects in your record</h2></div><Link href="/employee/projects" className="text-xs text-[#8c847b] hover:text-[#c6b5f2]">View projects</Link></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{PROJECTS.filter((project) => MAYA.projectIds.includes(project.id)).map((project) => {
            const latest = visibleContributions.find((item) => item.projectId === project.id)
            return <Link key={project.id} href={`/employee/projects/${project.id}`} className="group rounded-xl border border-white/[0.07] bg-black/10 p-4 transition hover:border-[#a98cf5]/30"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[#d0c8bd]">{project.name}</p><p className="mt-1 text-xs text-[#716a63]">{project.shortName}</p></div><ArrowRight size={13} className="text-white/20 group-hover:text-[#b8a1f4]" /></div>{latest && <p className="mt-3 line-clamp-1 text-xs text-[#8e877f]">Latest: {latest.title}</p>}</Link>
          })}</div>
        </div>

        <div className="panel p-6 sm:p-7"><p className="eyebrow">Skills demonstrated</p><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Built through the work</h2><div className="mt-5 flex flex-wrap gap-2">{skills.slice(0, 10).map((skill) => <Link href="/employee/skills" key={skill.name} className="skill-chip transition hover:border-[#a98cf5]/35 hover:text-[#d8ccef]">{skill.name}</Link>)}</div><Link href="/employee/skills" className="mt-6 flex items-center gap-1 text-sm text-[#a99e91] hover:text-[#c6b5f2]">See skill evidence<ArrowRight size={14} /></Link></div>
      </section>

      <EvidenceDrawer item={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
