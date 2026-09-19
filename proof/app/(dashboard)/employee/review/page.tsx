'use client'

import Link from 'next/link'
import { ArrowUpRight, CheckCircle2, FileText, Mail, UsersRound, Video, Wrench } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import PageHeader from '@/components/layout/PageHeader'
import OutlookReviewQueue from '@/components/dashboard/OutlookReviewQueue'
import { MAYA, PROJECTS } from '@/lib/fixtures'
import { contributionSource, sourceProviderLabel } from '@/lib/product'
import type { Contribution } from '@/types'

function EvidenceRow({ contribution }: { contribution: Contribution }) {
  const source = contributionSource(contribution)
  const SourceIcon = source.provider === 'OUTLOOK' ? Mail : Video
  return (
    <Link href={`/employee/contributions#${contribution.id}`} className="group flex items-start justify-between gap-4 border-b border-white/[0.07] py-4 last:border-0">
      <div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-[#d7cfc4]">{contribution.title}</p><span className="inline-flex items-center gap-1 text-[11px] text-[#716a63]"><SourceIcon size={11} />{sourceProviderLabel(contribution)}</span></div><p className="mt-1.5 text-xs leading-5 text-[#817a72]">{contribution.description}</p></div>
      <ArrowUpRight size={14} className="mt-1 shrink-0 text-white/20 transition group-hover:text-[#b8a1f4]" />
    </Link>
  )
}

export default function ReviewBriefPage() {
  const { visibleContributions, skills } = useSeen()
  const problems = visibleContributions.filter((item) => ['IMPROVED', 'UNBLOCKED', 'RESEARCHED'].includes(item.category))
  const collaboration = visibleContributions.filter((item) => item.skills.some((skill) => skill.includes('Collaboration') || skill.includes('Coordination')))
  const leadership = visibleContributions.filter((item) => ['LED', 'MENTORED'].includes(item.category))

  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="January–September 2026" title="Review brief" description="A living summary built automatically from Maya’s source-linked meeting and email evidence." action={<div className="flex items-center gap-2 text-xs text-[#827b72]"><FileText size={14} className="text-[#b8a1f4]" />Updated from current record</div>} />

      <OutlookReviewQueue />

      <section className="topography rounded-[28px] border border-[#8d72d8]/20 bg-[#8d72d8]/[0.055] p-7 sm:p-10">
        <p className="eyebrow text-[#b9a9e4]">Year-to-date summary</p>
        <p className="mt-4 max-w-5xl font-serif text-2xl leading-9 text-[#ede5da] sm:text-3xl sm:leading-[1.35]">Maya improved the reliability of sample-handling, life-support, and surface-power firmware for Ares Frontier’s Mars systems. She paired deep debugging with repeatable testing, helped teammates validate fixes, and increasingly coordinated integrated work across engineering groups.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6"><div className="flex items-center gap-2"><CheckCircle2 size={17} className="text-[#a6c8c2]" /><p className="eyebrow">Major outcomes</p></div><div className="mt-3">{visibleContributions.slice(0, 5).map((item) => <EvidenceRow key={item.id} contribution={item} />)}</div></div>
        <div className="panel p-6"><div className="flex items-center gap-2"><Wrench size={17} className="text-[#d5a88f]" /><p className="eyebrow">Problems solved</p></div><div className="mt-3">{problems.slice(0, 5).map((item) => <EvidenceRow key={item.id} contribution={item} />)}</div></div>
      </section>

      <section className="panel p-6 sm:p-8"><p className="eyebrow">Work by project</p><div className="mt-5 grid gap-4 md:grid-cols-2">{PROJECTS.filter((project) => MAYA.projectIds.includes(project.id)).map((project) => {
        const projectWork = visibleContributions.filter((item) => item.projectId === project.id)
        return <div key={project.id} className="rounded-2xl border border-white/[0.07] bg-black/10 p-5"><div className="flex items-start justify-between"><div><p className="text-xs text-[#777169]">{project.name}</p><h3 className="mt-1 font-serif text-xl text-[#ddd5ca]">{project.shortName}</h3></div><span className="text-xs text-[#716a63]">{projectWork.length} outcomes</span></div><ul className="mt-4 space-y-2">{projectWork.slice(0, 3).map((item) => <li key={item.id} className="text-sm leading-5 text-[#958e85]">— {item.title}</li>)}</ul></div>
      })}</div></section>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6"><div className="flex items-center gap-2"><UsersRound size={17} className="text-[#c5b5ed]" /><p className="eyebrow">Collaboration and unblocking</p></div><div className="mt-3">{collaboration.map((item) => <EvidenceRow key={item.id} contribution={item} />)}</div></div>
        <div className="panel p-6"><p className="eyebrow">Leadership and mentorship</p><div className="mt-3">{leadership.map((item) => <EvidenceRow key={item.id} contribution={item} />)}</div></div>
      </section>

      <section className="panel p-6 sm:p-8"><p className="eyebrow">Skills developed</p><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{skills.map((skill) => <div key={skill.name} className="rounded-xl border border-white/[0.07] p-4"><p className="text-sm font-medium text-[#d7cfc5]">{skill.name}</p><p className="mt-2 text-xs leading-5 text-[#837c74]">{skill.narrative}</p></div>)}</div></section>
    </div>
  )
}
