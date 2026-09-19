'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import ContributionCard from '@/components/dashboard/ContributionCard'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import type { Project } from '@/types'

const PROJECT_SUMMARIES: Record<string, string> = {
  'sample-collection': 'You strengthened the firmware behind sample handling from collection through caching. Your work made sensor readings more trustworthy, preserved tube identity during faults, and gave the robotics team clearer calibration and recovery steps.',
  'habitat-life-support': 'You made the habitat controller safer and easier to validate. You improved pressure and air-quality monitoring, reduced false alarms, tested backup recovery, and coordinated the integrated alarm work across engineering teams.',
  'surface-power': 'You improved how the habitat power controller behaves during cold starts and low-generation conditions. Your work protected battery limits, clarified dust-storm priorities, and added better evidence for difficult restart cases.',
}

export default function ProjectDetailClient({ project }: { project: Project }) {
  const { visibleContributions } = useSeen()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const contributions = visibleContributions.filter((item) => item.projectId === project.id)
  const skills = [...new Set(contributions.flatMap((item) => item.skills))]
  const selected = contributions.find((item) => item.id === selectedId) ?? null

  return (
    <div className="page-shell space-y-8">
      <Link href="/employee/projects" className="inline-flex items-center gap-2 text-sm text-[#8e877f] transition hover:text-[#c6b5f2]"><ArrowLeft size={15} />All projects</Link>

      <header className="border-b border-white/[0.08] pb-8">
        <p className="eyebrow">{project.name}</p>
        <h1 className="mt-3 max-w-4xl font-serif text-4xl tracking-[-0.03em] text-[#f4efe6] sm:text-5xl">{project.shortName}</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[#918a82]">{project.purpose}</p>
      </header>

      <section className="rounded-[24px] border border-[#8d72d8]/20 bg-[#8d72d8]/[0.055] p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <p className="eyebrow text-[#b5a4df]">Your work on this project</p>
            <p className="mt-4 font-serif text-2xl leading-9 text-[#e8dfd4]">{PROJECT_SUMMARIES[project.id] ?? project.mayaRole}</p>
          </div>
          <div className="shrink-0 rounded-2xl border border-white/[0.08] bg-black/10 px-5 py-4">
            <p className="text-2xl font-medium text-[#eee7dc]">{contributions.length}</p>
            <p className="mt-1 text-xs text-[#777169]">Evidence-backed contributions</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.07] pt-5">{skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="eyebrow">Project evidence</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Everything you contributed</h2></div>
          <p className="flex items-center gap-2 text-xs text-[#777169]"><CheckCircle2 size={13} className="text-[#78a89c]" />Meeting and Outlook evidence included</p>
        </div>
        {contributions.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {contributions.map((item) => <ContributionCard key={item.id} contribution={item} onClick={() => setSelectedId(item.id)} />)}
          </div>
        ) : (
          <div className="panel p-8 text-sm text-[#817a72]">No evidence has been captured for this project yet.</div>
        )}
      </section>

      <EvidenceDrawer item={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
