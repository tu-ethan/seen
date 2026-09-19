'use client'

import { useMemo, useState } from 'react'
import { Filter, SearchX } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import ContributionCard from '@/components/dashboard/ContributionCard'
import AnnualProjectTimeline from '@/components/dashboard/AnnualProjectTimeline'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import PageHeader from '@/components/layout/PageHeader'
import { PROJECTS } from '@/lib/fixtures'
import type { ContributionCategory } from '@/types'

const CATEGORIES: Array<{ value: ContributionCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All categories' }, { value: 'IMPROVED', label: 'Improved' }, { value: 'SHIPPED', label: 'Shipped' },
  { value: 'UNBLOCKED', label: 'Unblocked' }, { value: 'RESEARCHED', label: 'Researched' }, { value: 'MENTORED', label: 'Mentored' }, { value: 'LED', label: 'Led' },
]

export default function ContributionsPage() {
  const { visibleContributions, skills } = useSeen()
  const [project, setProject] = useState('ALL')
  const [skill, setSkill] = useState('ALL')
  const [category, setCategory] = useState<ContributionCategory | 'ALL'>('ALL')
  const [date, setDate] = useState('YEAR')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => visibleContributions
    .filter((item) => project === 'ALL' || item.projectId === project)
    .filter((item) => skill === 'ALL' || item.skills.includes(skill))
    .filter((item) => category === 'ALL' || item.category === category)
    .filter((item) => date === 'YEAR' || (date === 'QUARTER' ? item.date >= '2026-07-01' : item.date >= '2026-08-19'))
    .sort((a, b) => b.date.localeCompare(a.date)), [category, date, project, skill, visibleContributions])

  const selected = visibleContributions.find((item) => item.id === selectedId) ?? null
  const clear = () => { setProject('ALL'); setSkill('ALL'); setCategory('ALL'); setDate('YEAR') }

  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="Maya Chen · 2026" title="Your year" description="See when each project was active, then open any contribution to view the meeting evidence behind it." />

      <AnnualProjectTimeline contributions={visibleContributions} />

      <section className="panel flex flex-wrap items-center gap-3 p-4">
        <span className="mr-1 flex items-center gap-2 text-xs text-[#777169]"><Filter size={14} />Filter</span>
        <select aria-label="Filter by project" value={project} onChange={(event) => setProject(event.target.value)} className="select-field">
          <option value="ALL">All projects</option>{PROJECTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
        <select aria-label="Filter by skill" value={skill} onChange={(event) => setSkill(event.target.value)} className="select-field">
          <option value="ALL">All skills</option>{skills.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
        </select>
        <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value as ContributionCategory | 'ALL')} className="select-field">
          {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
        </select>
        <select aria-label="Filter by date" value={date} onChange={(event) => setDate(event.target.value)} className="select-field">
          <option value="YEAR">This year</option><option value="QUARTER">This quarter</option><option value="MONTH">Last 30 days</option>
        </select>
        <button onClick={clear} className="ml-auto text-xs text-[#898178] transition hover:text-[#c6b5f2]">Clear filters</button>
      </section>

      <div className="flex items-end justify-between gap-4"><div><p className="eyebrow">Contribution evidence</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">What you accomplished</h2></div><p className="text-xs text-[#625d57]">{filtered.length} source-linked {filtered.length === 1 ? 'contribution' : 'contributions'}</p></div>

      {filtered.length ? (
        <section className="grid gap-4 lg:grid-cols-2">
          {filtered.map((contribution) => <ContributionCard key={contribution.id} contribution={contribution} onClick={() => setSelectedId(contribution.id)} />)}
        </section>
      ) : (
        <section className="panel flex min-h-72 flex-col items-center justify-center px-5 text-center"><SearchX size={26} className="text-[#6d665f]" /><h2 className="mt-4 font-serif text-2xl text-[#d8d0c5]">No contributions match these filters.</h2><button onClick={clear} className="secondary-button mt-5">Clear filters</button></section>
      )}

      <EvidenceDrawer item={selected} onClose={() => setSelectedId(null)} />
    </div>
  )
}
