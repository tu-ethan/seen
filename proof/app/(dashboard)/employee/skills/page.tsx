'use client'

import Link from 'next/link'
import { ArrowUpRight, Calendar, Layers3 } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import PageHeader from '@/components/layout/PageHeader'
import { formatDate, projectById } from '@/lib/product'

export default function SkillsPage() {
  const { skills } = useSeen()
  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="Evidence-backed development" title="Skills" description="No proficiency scores. Every skill below is connected to work Maya described, the project where it mattered, and the meeting where it was captured." />
      <section className="grid gap-4 lg:grid-cols-2">
        {skills.map((skill) => (
          <article key={skill.name} className="panel p-6">
            <div className="flex items-start justify-between gap-4"><h2 className="font-serif text-2xl text-[#eee7dc]">{skill.name}</h2><span className="rounded-full border border-[#8d72d8]/25 bg-[#8d72d8]/[0.07] px-3 py-1 text-xs text-[#c7b8ee]">{skill.meetingCount} {skill.meetingCount === 1 ? 'meeting' : 'meetings'}</span></div>
            <p className="mt-4 text-sm leading-6 text-[#9e968d]">{skill.narrative}</p>
            <dl className="mt-5 grid gap-4 border-y border-white/[0.07] py-4 text-xs sm:grid-cols-2">
              <div><dt className="flex items-center gap-1.5 text-[#6f6962]"><Calendar size={12} />First demonstrated</dt><dd className="mt-1.5 text-[#bab2a8]">{formatDate(skill.firstDemonstrated)}</dd></div>
              <div><dt className="flex items-center gap-1.5 text-[#6f6962]"><Layers3 size={12} />Related projects</dt><dd className="mt-1.5 text-[#bab2a8]">{skill.projectIds.map((id) => projectById(id)?.name).join(', ')}</dd></div>
            </dl>
            <div className="mt-5"><p className="eyebrow">Recent evidence</p><div className="mt-3 space-y-2">{skill.examples.map((example) => (
              <Link key={example.id} href={`/employee/contributions#${example.id}`} className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-black/10 px-4 py-3 text-sm text-[#aaa298] transition hover:border-[#a98cf5]/30 hover:text-[#ddd3c8]"><span className="line-clamp-1">{example.title}</span><ArrowUpRight size={13} className="shrink-0 text-white/25 group-hover:text-[#b8a1f4]" /></Link>
            ))}</div></div>
          </article>
        ))}
      </section>
    </div>
  )
}
