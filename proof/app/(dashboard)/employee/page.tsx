'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, CalendarCheck, CheckCircle2, Clock3, Sparkles } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import ContributionCard from '@/components/dashboard/ContributionCard'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import { MAYA, PROJECTS } from '@/lib/fixtures'
import { meetingTitle, projectById } from '@/lib/product'

export default function EmployeeDashboard() {
  const { visibleContributions, skills } = useSeen()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = visibleContributions.find((item) => item.id === selectedId) ?? null
  const recent = visibleContributions.slice(0, 6)
  const evidence = visibleContributions.slice(0, 5)

  return (
    <div className="page-shell space-y-10">
      <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">Friday, September 18</p>
          <h1 className="mt-3 font-serif text-4xl tracking-[-0.03em] text-[#f4efe6] sm:text-5xl">Good morning, {MAYA.name.split(' ')[0]}.</h1>
          <p className="mt-3 text-sm text-[#8f887f]">Here is the work Seen has added to your record.</p>
        </div>
        <div className="inline-flex items-center gap-3 rounded-full border border-[#52796f]/30 bg-[#52796f]/[0.08] px-4 py-2 text-xs text-[#a7c9c0]"><CalendarCheck size={14} />Up to date · Meetings sync in the background</div>
      </header>

      <section className="grid gap-6 xl:grid-cols-[1.45fr_0.75fr]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="eyebrow">Your contributions</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">What you moved forward</h2></div>
            <Link href="/employee/contributions" className="flex items-center gap-1 text-sm text-[#a99e91] transition hover:text-[#c6b5f2]">See yearly timeline<ArrowRight size={15} /></Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">{recent.map((contribution) => <ContributionCard key={contribution.id} contribution={contribution} compact onClick={() => setSelectedId(contribution.id)} />)}</div>
        </div>

        <aside className="panel h-fit p-6 sm:p-7">
          <div className="flex items-center justify-between"><div><p className="eyebrow">Your evidence</p><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Specific moments, saved</h2></div><Sparkles size={18} className="text-[#a98cf5]" /></div>
          <ul className="mt-5 space-y-1">
            {evidence.map((item) => (
              <li key={item.id} className="border-b border-white/[0.07] py-4 first:pt-0 last:border-0 last:pb-0">
                <button onClick={() => setSelectedId(item.id)} className="group w-full text-left">
                  <span className="flex items-start gap-3"><CheckCircle2 size={15} className="mt-1 shrink-0 text-[#76a297]" /><span><span className="block text-sm leading-6 text-[#d2c9bf] transition group-hover:text-[#eee6db]">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#817a72]">{item.evidence[0].quote}</span></span></span>
                  <span className="mt-2 flex items-center gap-1.5 pl-7 text-[11px] text-[#68625c]"><Clock3 size={11} />{item.evidence[0].timestamp} · {meetingTitle(item.meetingId)}</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel p-6 sm:p-7">
          <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Mission work</p><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Projects in your record</h2></div><Link href="/employee/projects" className="text-xs text-[#8c847b] hover:text-[#c6b5f2]">View projects</Link></div>
          <div className="mt-5 grid gap-2 sm:grid-cols-2">{PROJECTS.map((project) => {
            const latest = visibleContributions.find((item) => item.projectId === project.id)
            return <Link key={project.id} href={`/employee/projects/${project.id}`} className="group rounded-xl border border-white/[0.07] bg-black/10 p-4 transition hover:border-[#a98cf5]/30"><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-[#d0c8bd]">{project.name}</p><p className="mt-1 text-xs text-[#716a63]">{project.shortName}</p></div><ArrowRight size={13} className="text-white/20 group-hover:text-[#b8a1f4]" /></div>{latest && <p className="mt-3 line-clamp-1 text-xs text-[#8e877f]">Latest: {latest.title}</p>}</Link>
          })}</div>
        </div>

        <div className="panel p-6 sm:p-7"><p className="eyebrow">Skills demonstrated</p><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Built through the work</h2><div className="mt-5 flex flex-wrap gap-2">{skills.slice(0, 10).map((skill) => <Link href="/employee/skills" key={skill.name} className="skill-chip transition hover:border-[#a98cf5]/35 hover:text-[#d8ccef]">{skill.name}</Link>)}</div><Link href="/employee/skills" className="mt-6 flex items-center gap-1 text-sm text-[#a99e91] hover:text-[#c6b5f2]">See skill evidence<ArrowRight size={14} /></Link></div>
      </section>

      <p className="text-xs text-[#5f5953]">Latest evidence spans {projectById(recent[0]?.projectId)?.name ?? 'your current work'} and other active mission systems.</p>
      <EvidenceDrawer item={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
