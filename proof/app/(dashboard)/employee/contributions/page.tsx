'use client'

import { useState } from 'react'
import { cn, formatDate } from '@/lib/utils'
import type { ContributionType } from '@/types'
import EvidenceDrawer from '@/components/dashboard/EvidenceDrawer'

export default function EmployeeContributionsPage() {
  const [filterType, setFilterType] = useState<ContributionType | 'ALL'>('ALL')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)

  // Demo Maya Chen 15 contributions
  const allContributions = [
    { id: '1', type: 'EXECUTION', title: 'Implemented Pricing UI', project: 'Project Nova', date: '2023-10-15', confidence: 0.95, description: 'Built new pricing components.', evidence: ['I finished the pricing UI components.'], skills: ['React', 'UI/UX'] },
    { id: '2', type: 'IDEATION', title: 'Proposed offline mode architecture', project: 'Project Orbit', date: '2023-10-14', confidence: 0.88, description: 'Suggested ServiceWorker caching.', evidence: ['What if we use a ServiceWorker?'], skills: ['System Design'] },
    { id: '3', type: 'COLLABORATION', title: 'Paired with backend on API design', project: 'Project Atlas', date: '2023-10-12', confidence: 0.92, description: 'Worked on GraphQL schema.', evidence: ['Aligned on schema.'], skills: ['API Design'] },
    { id: '4', type: 'RESEARCH', title: 'Competitor analysis for pricing', project: 'Project Nova', date: '2023-10-10', confidence: 0.85, description: 'Analyzed competitor models.', evidence: ['Found they use tier-based pricing.'], skills: ['Research'] },
    { id: '5', type: 'LEADERSHIP', title: 'Led sprint planning', project: 'Project Nova', date: '2023-10-09', confidence: 0.96, description: 'Organized tickets for sprint.', evidence: ['Let’s tackle these 5 tickets.'], skills: ['Leadership'] },
    { id: '6', type: 'OWNERSHIP', title: 'Fixed production bug in billing', project: 'Core', date: '2023-10-08', confidence: 0.99, description: 'Resolved P1 billing issue.', evidence: ['Deployed the hotfix.'], skills: ['Debugging'] },
    { id: '7', type: 'EXECUTION', title: 'Migrated to Next.js App Router', project: 'Web App', date: '2023-10-05', confidence: 0.94, description: 'Moved pages directory to app.', evidence: ['Migration is complete.'], skills: ['Next.js', 'React'] },
    { id: '8', type: 'IDEATION', title: 'Brainstormed new notification system', project: 'Growth', date: '2023-10-02', confidence: 0.82, description: 'Shared ideas on notifications.', evidence: ['Maybe we can use WebSockets.'], skills: ['System Design'] },
    { id: '9', type: 'COLLABORATION', title: 'Onboarded new engineer', project: 'Team', date: '2023-09-28', confidence: 0.91, description: 'Helped Alex set up environment.', evidence: ['Let me show you how to run it.'], skills: ['Mentoring'] },
    { id: '10', type: 'RESEARCH', title: 'Investigated memory leak', project: 'Core', date: '2023-09-25', confidence: 0.89, description: 'Profiled Node.js memory usage.', evidence: ['Found the leak in the cache layer.'], skills: ['Profiling', 'Node.js'] },
    { id: '11', type: 'EXECUTION', title: 'Added e2e tests for checkout', project: 'Project Nova', date: '2023-09-22', confidence: 0.97, description: 'Wrote Playwright tests.', evidence: ['Checkout tests are passing.'], skills: ['Testing'] },
    { id: '12', type: 'LEADERSHIP', title: 'Presented at all-hands', project: 'Company', date: '2023-09-15', confidence: 0.95, description: 'Shared Q3 engineering updates.', evidence: ['We achieved 99.9% uptime.'], skills: ['Public Speaking'] },
    { id: '13', type: 'OWNERSHIP', title: 'Refactored auth middleware', project: 'Core', date: '2023-09-10', confidence: 0.93, description: 'Cleaned up auth logic.', evidence: ['Auth middleware is much cleaner now.'], skills: ['Security', 'Refactoring'] },
    { id: '14', type: 'EXECUTION', title: 'Optimized image loading', project: 'Web App', date: '2023-09-05', confidence: 0.88, description: 'Implemented lazy loading.', evidence: ['LCP improved by 20%.'], skills: ['Performance'] },
    { id: '15', type: 'IDEATION', title: 'Suggested redesign of settings page', project: 'Web App', date: '2023-09-01', confidence: 0.79, description: 'Sketched new settings layout.', evidence: ['Users are confused by settings.'], skills: ['UI/UX'] },
  ]

  const types: (ContributionType | 'ALL')[] = ['ALL', 'EXECUTION', 'RESEARCH', 'IDEATION', 'OWNERSHIP', 'COLLABORATION', 'LEADERSHIP']

  const TYPE_CONFIG: Record<ContributionType, { label: string; classes: string }> = {
    EXECUTION: { label: 'Execution', classes: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
    RESEARCH: { label: 'Research', classes: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
    IDEATION: { label: 'Ideation', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
    OWNERSHIP: { label: 'Ownership', classes: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
    COLLABORATION: { label: 'Collaboration', classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
    LEADERSHIP: { label: 'Leadership', classes: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  }

  const confidenceLabel = (c: number) => {
    if (c >= 0.9) return { label: 'High', classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' }
    if (c >= 0.75) return { label: 'Medium', classes: 'bg-amber-500/10 text-amber-400 border-amber-500/20' }
    return { label: 'Low', classes: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' }
  }

  const filtered = filterType === 'ALL' ? allContributions : allContributions.filter(c => c.type === filterType)

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100">Contribution History</h1>
          <p className="text-zinc-500 mt-1">Maya Chen</p>
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as ContributionType | 'ALL')}
          className="bg-[#141416] border border-[#27272A] text-zinc-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-[#3F3F46]"
        >
          {types.map(t => (
            <option key={t} value={t}>
              {t === 'ALL' ? 'All Types' : TYPE_CONFIG[t as ContributionType].label}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-[#27272A] rounded-xl bg-[#141416] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#27272A] bg-[#0F0F10]">
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Type</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Title</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Project</th>
              <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wide">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272A]">
            {filtered.map((item) => {
              const typeCfg = TYPE_CONFIG[item.type as ContributionType]
              const conf = confidenceLabel(item.confidence)
              return (
                <tr 
                  key={item.id} 
                  onClick={() => setSelectedItem(item)}
                  className="hover:bg-[#1A1A1D] transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 text-sm text-zinc-400 whitespace-nowrap">{formatDate(item.date)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', typeCfg.classes)}>
                      {typeCfg.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-zinc-200">{item.title}</td>
                  <td className="px-6 py-4 text-sm text-zinc-400">{item.project}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border', conf.classes)}>
                      {conf.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-zinc-500 text-sm">
            No contributions found for this filter.
          </div>
        )}
      </div>

      <EvidenceDrawer item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  )
}
