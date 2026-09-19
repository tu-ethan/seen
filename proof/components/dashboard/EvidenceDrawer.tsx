'use client'

import { Clock3, X } from 'lucide-react'
import { categoryLabel } from '@/components/dashboard/ContributionCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { formatDate, meetingTitle, projectById } from '@/lib/product'
import type { Contribution } from '@/types'

export default function EvidenceDrawer({ item, onClose }: { item: Contribution | null; onClose: () => void }) {
  if (!item) return null
  const project = projectById(item.projectId)

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close evidence" className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="animate-drawer absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-white/10 bg-[#11100f] shadow-2xl">
        <header className="flex items-start justify-between border-b border-white/[0.08] px-6 py-5 sm:px-8">
          <div><p className="eyebrow">Source evidence</p><div className="mt-3"><StatusBadge status={item.status} /></div></div>
          <button aria-label="Close drawer" onClick={onClose} className="icon-button"><X size={18} /></button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b39a8e]">{categoryLabel(item.category)}</p>
          <h2 className="mt-3 font-serif text-3xl leading-tight text-[#f4efe6]">{item.title}</h2>
          <p className="mt-4 leading-7 text-[#aaa49a]">{item.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-white/[0.08] py-5 text-sm">
            <div><dt className="text-xs text-[#716c65]">Project</dt><dd className="mt-1 text-[#d4cec4]">{project?.name}</dd></div>
            <div><dt className="text-xs text-[#716c65]">Captured</dt><dd className="mt-1 text-[#d4cec4]">{formatDate(item.date)}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-[#716c65]">Source</dt><dd className="mt-1 text-[#d4cec4]">{meetingTitle(item.meetingId)}</dd></div>
          </dl>

          <section className="mt-8">
            <p className="eyebrow">What Maya said</p>
            <div className="mt-3 space-y-3">
              {item.evidence.map((evidence) => (
                <blockquote key={`${evidence.timestamp}-${evidence.quote}`} className="rounded-2xl border border-[#8d72d8]/25 bg-[#8d72d8]/[0.07] p-5">
                  <p className="font-serif text-lg leading-7 text-[#e5ded3]">“{evidence.quote}”</p>
                  <footer className="mt-4 flex items-center gap-2 text-xs text-[#8f897f]"><Clock3 size={12} />{evidence.timestamp} · {evidence.speaker}</footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="mt-8"><p className="eyebrow">Skills demonstrated</p><div className="mt-3 flex flex-wrap gap-2">{item.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div></section>
        </div>
      </aside>
    </div>
  )
}
