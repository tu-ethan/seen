'use client'
import { cn } from '@/lib/utils'
import type { ContributionType } from '@/types'

interface ContributionCardProps {
  contribution: {
    id: string
    type: ContributionType
    title: string
    description: string
    project?: string
    date: string
    confidence: number
    evidence?: string
  }
  onClick?: () => void
}

const TYPE_CONFIG: Record<ContributionType, { label: string; classes: string; dot: string }> = {
  EXECUTION: { label: 'Execution', classes: 'bg-violet-500/15 text-violet-300 border-violet-500/25', dot: 'bg-violet-400' },
  RESEARCH: { label: 'Research', classes: 'bg-blue-500/15 text-blue-300 border-blue-500/25', dot: 'bg-blue-400' },
  IDEATION: { label: 'Ideation', classes: 'bg-amber-500/15 text-amber-300 border-amber-500/25', dot: 'bg-amber-400' },
  OWNERSHIP: { label: 'Ownership', classes: 'bg-orange-500/15 text-orange-300 border-orange-500/25', dot: 'bg-orange-400' },
  COLLABORATION: { label: 'Collaboration', classes: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25', dot: 'bg-emerald-400' },
  LEADERSHIP: { label: 'Leadership', classes: 'bg-rose-500/15 text-rose-300 border-rose-500/25', dot: 'bg-rose-400' },
}

function confidenceLabel(c: number) {
  if (c >= 0.9) return { label: 'High', classes: 'text-emerald-400' }
  if (c >= 0.75) return { label: 'Medium', classes: 'text-amber-400' }
  return { label: 'Low', classes: 'text-zinc-500' }
}

export default function ContributionCard({ contribution, onClick }: ContributionCardProps) {
  const type = TYPE_CONFIG[contribution.type]
  const conf = confidenceLabel(contribution.confidence)
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border border-[#27272A] bg-[#141416] p-4 space-y-2',
        onClick && 'cursor-pointer hover:bg-[#1A1A1D] hover:border-[#3F3F46] transition-colors'
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn('w-2 h-2 rounded-full shrink-0', type.dot)} />
        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-md border', type.classes)}>{type.label}</span>
        <span className="text-xs text-zinc-600 ml-auto">{contribution.date}</span>
      </div>
      <p className="text-sm font-medium text-zinc-200">{contribution.title}</p>
      <p className="text-xs text-zinc-500 line-clamp-2">{contribution.description}</p>
      <div className="flex items-center gap-3 pt-1">
        {contribution.project && (
          <span className="text-xs text-zinc-600">{contribution.project}</span>
        )}
        <span className={cn('text-xs font-medium ml-auto', conf.classes)}>{conf.label} confidence</span>
      </div>
    </div>
  )
}
