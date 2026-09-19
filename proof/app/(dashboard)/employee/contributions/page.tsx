'use client'

import { useMemo, useState } from 'react'
import { Filter, Search, SearchX, X } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import ContributionCard from '@/components/dashboard/ContributionCard'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'
import PageHeader from '@/components/layout/PageHeader'
import { MAYA, PROJECTS } from '@/lib/fixtures'
import { contributionSource, projectById, sourceProviderLabel } from '@/lib/product'
import type { ContributionCategory, EvidenceProvider } from '@/types'

type DateRange = 'YEAR' | 'QUARTER' | 'MONTH'
type SourceFilter = EvidenceProvider | 'ALL'

const DATE_STARTS: Record<DateRange, string> = {
  YEAR: '2026-01-01',
  QUARTER: '2026-07-01',
  MONTH: '2026-08-20',
}

const CATEGORIES: Array<{ value: ContributionCategory | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All categories' }, { value: 'IMPROVED', label: 'Improved' }, { value: 'SHIPPED', label: 'Shipped' },
  { value: 'UNBLOCKED', label: 'Unblocked' }, { value: 'RESEARCHED', label: 'Researched' }, { value: 'MENTORED', label: 'Mentored' }, { value: 'LED', label: 'Led' },
]

export default function ContributionsPage() {
  const { visibleContributions, skills } = useSeen()
  const [project, setProject] = useState('ALL')
  const [skill, setSkill] = useState('ALL')
  const [category, setCategory] = useState<ContributionCategory | 'ALL'>('ALL')
  const [source, setSource] = useState<SourceFilter>('ALL')
  const [date, setDate] = useState<DateRange>('YEAR')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
    return visibleContributions
      .filter((item) => {
        const sourceDetails = contributionSource(item)
        const searchText = [
          item.title,
          item.description,
          projectById(item.projectId)?.name,
          projectById(item.projectId)?.shortName,
          item.category,
          ...item.skills,
          ...item.evidence.map((evidence) => evidence.quote),
          ...item.evidence.map((evidence) => evidence.speaker),
          sourceDetails.title,
          sourceDetails.sender,
          sourceProviderLabel(item),
        ].filter(Boolean).join(' ').toLocaleLowerCase()
        return terms.every((term) => searchText.includes(term))
      })
      .filter((item) => project === 'ALL' || item.projectId === project)
      .filter((item) => skill === 'ALL' || item.skills.includes(skill))
      .filter((item) => category === 'ALL' || item.category === category)
      .filter((item) => source === 'ALL' || contributionSource(item).provider === source)
      .filter((item) => item.date >= DATE_STARTS[date])
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [category, date, project, query, skill, source, visibleContributions])

  const selected = visibleContributions.find((item) => item.id === selectedId) ?? null
  const hasActiveFilters = Boolean(query.trim()) || project !== 'ALL' || skill !== 'ALL' || category !== 'ALL' || source !== 'ALL' || date !== 'YEAR'
  const clear = () => { setProject('ALL'); setSkill('ALL'); setCategory('ALL'); setSource('ALL'); setDate('YEAR'); setQuery('') }

  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="Maya Chen · 2026" title="Impact" description="Search the work Seen captured, narrow it by project or skill, and open any contribution to view its source evidence." />

      <section className="panel space-y-3 p-4">
        <label className="relative block">
          <span className="sr-only">Search contribution evidence</span>
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6e6861]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accomplishments, projects, skills, or evidence" className="field h-11 pl-10 pr-10" />
          {query && <button aria-label="Clear search" onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-[#777169] transition hover:bg-white/[0.05] hover:text-[#d8d0c5]"><X size={14} /></button>}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <span className="mr-1 flex items-center gap-2 text-xs text-[#777169]"><Filter size={14} />Filter</span>
          <select aria-label="Filter by project" value={project} onChange={(event) => setProject(event.target.value)} className="select-field">
            <option value="ALL">All projects</option>{PROJECTS.filter((item) => MAYA.projectIds.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <select aria-label="Filter by skill" value={skill} onChange={(event) => setSkill(event.target.value)} className="select-field">
            <option value="ALL">All skills</option>{skills.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
          </select>
          <select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value as ContributionCategory | 'ALL')} className="select-field">
            {CATEGORIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <select aria-label="Filter by source" value={source} onChange={(event) => setSource(event.target.value as SourceFilter)} className="select-field">
            <option value="ALL">All sources</option><option value="GOOGLE_MEET">Google Meet</option><option value="OUTLOOK">Outlook email</option>
          </select>
          <select aria-label="Filter by date" value={date} onChange={(event) => setDate(event.target.value as DateRange)} className="select-field">
            <option value="YEAR">This year</option><option value="QUARTER">This quarter</option><option value="MONTH">Last 30 days</option>
          </select>
          <button onClick={clear} disabled={!hasActiveFilters} className="ml-auto text-xs text-[#898178] transition hover:text-[#c6b5f2] disabled:cursor-default disabled:opacity-35">Reset all</button>
        </div>
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
