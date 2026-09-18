'use client'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContributionType } from '@/types'

interface EvidenceItem {
  id: string
  type: ContributionType
  title: string
  description: string
  project?: string
  meeting?: string
  date: string
  confidence: number
  evidence: string[]
  skills: string[]
  isVerified?: boolean
}

interface EvidenceDrawerProps {
  item: EvidenceItem | null
  onClose: () => void
}

const TYPE_CONFIG: Record<ContributionType, { label: string; classes: string }> = {
  EXECUTION: { label: 'Execution', classes: 'bg-violet-500/15 text-violet-300 border-violet-500/25' },
  RESEARCH: { label: 'Research', classes: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  IDEATION: { label: 'Ideation', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  OWNERSHIP: { label: 'Ownership', classes: 'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  COLLABORATION: { label: 'Collaboration', classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  LEADERSHIP: { label: 'Leadership', classes: 'bg-rose-500/15 text-rose-300 border-rose-500/25' },
}

function confidenceLabel(c: number): { label: string; classes: string; note: string } {
  if (c >= 0.9) return { label: 'High', classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', note: 'Directly supported by transcript evidence' }
  if (c >= 0.75) return { label: 'Medium', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/25', note: 'Supported by contextual evidence' }
  return { label: 'Low', classes: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25', note: 'Inferred from limited evidence' }
}

export default function EvidenceDrawer({ item, onClose }: EvidenceDrawerProps) {
  if (!item) return null
  const type = TYPE_CONFIG[item.type]
  const conf = confidenceLabel(item.confidence)

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[480px] bg-[#141416] border-l border-[#27272A] z-50 flex flex-col animate-slide-in-right overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#27272A]">
          <div className="space-y-1">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', type.classes)}>{type.label}</span>
            <h2 className="text-base font-semibold text-zinc-100 mt-2">{item.title}</h2>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors mt-1">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Description */}
          <div>
            <p className="text-sm text-zinc-400 leading-relaxed">{item.description}</p>
          </div>

          {/* Confidence */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Confidence</p>
            <div className="flex items-center gap-3">
              <span className={cn('text-xs font-medium px-2.5 py-1 rounded-md border', conf.classes)}>{conf.label}</span>
              <p className="text-xs text-zinc-600">{conf.note}</p>
            </div>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Source</p>
            <div className="rounded-lg border border-[#27272A] bg-[#0F0F10] px-4 py-3 space-y-1">
              {item.meeting && <p className="text-sm font-medium text-zinc-300">{item.meeting}</p>}
              <p className="text-xs text-zinc-500">{item.date}</p>
              {item.project && <p className="text-xs text-zinc-600">{item.project}</p>}
            </div>
          </div>

          {/* Evidence */}
          {item.evidence.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Evidence</p>
              <div className="space-y-2">
                {item.evidence.map((quote, i) => (
                  <div key={i} className="border-l-2 border-violet-500/40 pl-3 py-1">
                    <p className="text-xs text-zinc-400 italic leading-relaxed">&ldquo;{quote}&rdquo;</p>
                    <p className="text-xs text-zinc-700 mt-1">Direct quote from transcript</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {item.skills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Skills demonstrated</p>
              <div className="flex flex-wrap gap-2">
                {item.skills.map((skill) => (
                  <span key={skill} className="text-xs px-2.5 py-1 rounded-md bg-[#1A1A1D] border border-[#27272A] text-zinc-400">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Verified on Solana */}
          {item.isVerified && (
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <p className="text-xs text-emerald-400 font-medium">Proof anchored on Solana Devnet</p>
              <ExternalLink size={12} className="text-emerald-500 ml-auto" />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
