'use client'

import Link from 'next/link'
import { ArrowUpRight, RadioTower } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import AnnualProjectTimeline from '@/components/dashboard/AnnualProjectTimeline'
import PageHeader from '@/components/layout/PageHeader'
import { MAYA, PROJECTS } from '@/lib/fixtures'

const ACCENTS = {
  rust: 'border-[#9b4f35]/30 before:bg-[#9b4f35]', lilac: 'border-[#8d72d8]/30 before:bg-[#8d72d8]',
  sand: 'border-[#98784c]/30 before:bg-[#98784c]', blue: 'border-[#536b91]/30 before:bg-[#536b91]',
  green: 'border-[#52796f]/30 before:bg-[#52796f]',
}

export default function ProjectsPage() {
  const { visibleContributions } = useSeen()
  const projects = PROJECTS.filter((project) => MAYA.projectIds.includes(project.id))
  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="Mission portfolio" title="Projects" description="The Mars systems Maya supports, why they matter, and the evidence of her work over time." action={<div className="flex items-center gap-2 text-xs text-[#8e867d]"><RadioTower size={14} className="text-[#b8a1f4]" />{projects.length} mission systems</div>} />
      <AnnualProjectTimeline contributions={visibleContributions} />
      <section className="grid gap-5 lg:grid-cols-2">
        {projects.map((project) => {
          const work = visibleContributions.filter((item) => item.projectId === project.id)
          const skills = [...new Set(work.flatMap((item) => item.skills))]
          return (
            <Link key={project.id} href={`/employee/projects/${project.id}`} className={`panel group relative overflow-hidden border p-6 before:absolute before:inset-x-0 before:top-0 before:h-[2px] ${ACCENTS[project.accent]}`}>
              <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">{project.name}</p><h2 className="mt-3 font-serif text-3xl text-[#eee7dc]">{project.shortName}</h2></div><ArrowUpRight size={18} className="text-white/25 transition group-hover:text-[#b8a1f4]" /></div>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#989087]">{project.purpose}</p>
              <div className="mt-6 rounded-xl border border-white/[0.07] bg-black/15 p-4"><p className="text-[11px] uppercase tracking-[0.14em] text-[#6f6962]">Latest progress</p><p className="mt-2 text-sm leading-6 text-[#c1b9af]">{work[0]?.title ?? project.latestProgress}</p></div>
              <div className="mt-5 flex flex-wrap items-center gap-2"><span className="mr-2 text-xs text-[#706a63]">{project.status}</span>{skills.slice(0, 4).map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
