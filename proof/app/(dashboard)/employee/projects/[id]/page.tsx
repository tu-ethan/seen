'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { ArrowLeft, CircleDot, Wrench } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import ContributionCard from '@/components/dashboard/ContributionCard'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import { PROJECTS } from '@/lib/fixtures'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { visibleContributions } = useSeen()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const project = PROJECTS.find((item) => item.id === id)

  if (!project) return <div className="page-shell"><div className="panel p-8"><h1 className="font-serif text-3xl">Project not found</h1><Link href="/employee/projects" className="secondary-button mt-5">Return to projects</Link></div></div>

  const contributions = visibleContributions.filter((item) => item.projectId === project.id)
  const skills = [...new Set(contributions.flatMap((item) => item.skills))]
  const selected = visibleContributions.find((item) => item.id === selectedId) ?? null

  return (
    <div className="page-shell space-y-8">
      <Link href="/employee/projects" className="inline-flex items-center gap-2 text-sm text-[#8e877f] transition hover:text-[#c6b5f2]"><ArrowLeft size={15} />All projects</Link>
      <header className="topography relative overflow-hidden rounded-[28px] border border-white/[0.09] bg-[#141311] p-7 sm:p-10">
        <div className="absolute right-8 top-8 h-32 w-32 rounded-full bg-[#9b4f35]/[0.08] blur-2xl" />
        <div className="relative max-w-4xl"><div className="flex flex-wrap items-center gap-3"><p className="eyebrow">{project.name}</p><span className="flex items-center gap-1.5 rounded-full border border-[#52796f]/35 bg-[#52796f]/10 px-2.5 py-1 text-[11px] text-[#a5c7be]"><CircleDot size={10} />{project.status}</span></div><h1 className="mt-4 font-serif text-4xl leading-none text-[#f4efe6] sm:text-6xl">{project.shortName}</h1><p className="mt-5 max-w-2xl text-base leading-7 text-[#aaa198]">{project.purpose}</p></div>
      </header>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-6"><p className="eyebrow">Maya’s role</p><p className="mt-3 font-serif text-2xl leading-9 text-[#ded6ca]">{project.mayaRole}</p></div>
        <div className="panel p-6"><p className="eyebrow">Latest progress</p><p className="mt-3 text-sm leading-7 text-[#b0a89e]">{contributions[0]?.description ?? project.latestProgress}</p></div>
      </section>

      <section><div className="mb-5"><p className="eyebrow">Skills demonstrated</p><div className="mt-3 flex flex-wrap gap-2">{skills.map((skill) => <span key={skill} className="skill-chip"><Wrench size={11} className="mr-1 inline" />{skill}</span>)}</div></div></section>

      <section><p className="eyebrow">Contributions over time</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Evidence from the work</h2><div className="mt-5 grid gap-4 lg:grid-cols-2">{contributions.map((item) => <ContributionCard key={item.id} contribution={item} onClick={() => setSelectedId(item.id)} />)}</div></section>
      <EvidenceDrawer item={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
