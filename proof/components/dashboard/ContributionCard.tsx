'use client'

import { ArrowUpRight, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, projectById } from '@/lib/product'
import type { Contribution, ContributionCategory } from '@/types'
import StatusBadge from './StatusBadge'

interface ContributionCardProps {
  contribution: Contribution
  onClick?: () => void
  compact?: boolean
}

const CATEGORY_CONFIG: Record<ContributionCategory, { label: string; classes: string }> = {
  IMPROVED: { label: 'Improved', classes: 'text-[#d9b49f] border-[#8f4930]/55 bg-[#8f4930]/10' },
  SHIPPED: { label: 'Shipped', classes: 'text-[#cdbdf8] border-[#8d72d8]/45 bg-[#8d72d8]/10' },
  UNBLOCKED: { label: 'Unblocked', classes: 'text-[#a6c8c2] border-[#517a73]/50 bg-[#517a73]/10' },
  RESEARCHED: { label: 'Researched', classes: 'text-[#aebed8] border-[#536b91]/50 bg-[#536b91]/10' },
  MENTORED: { label: 'Mentored', classes: 'text-[#dec99f] border-[#947747]/50 bg-[#947747]/10' },
  LED: { label: 'Led', classes: 'text-[#d9b4c0] border-[#8d5264]/50 bg-[#8d5264]/10' },
}

export const categoryLabel = (category: ContributionCategory) => CATEGORY_CONFIG[category].label

export default function ContributionCard({ contribution, onClick, compact = false }: ContributionCardProps) {
  const category = CATEGORY_CONFIG[contribution.category]
  const project = projectById(contribution.projectId)

  return (
    <article
      id={contribution.id}
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#141311] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.18)] transition duration-300',
        onClick && 'cursor-pointer hover:-translate-y-0.5 hover:border-[#a98cf5]/45 hover:bg-[#181614]',
        contribution.status === 'DISMISSED' && 'opacity-55',
      )}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]', category.classes)}>
          {category.label}
        </span>
        <StatusBadge status={contribution.status} />
        {onClick && <ArrowUpRight className="ml-auto text-white/25 transition group-hover:text-[#b8a1f4]" size={16} />}
      </div>
      <h3 className={cn('font-serif text-[1.35rem] leading-tight text-[#f4efe6]', compact && 'text-lg')}>{contribution.title}</h3>
      <p className={cn('mt-2 text-sm leading-6 text-[#aaa49a]', compact ? 'line-clamp-2' : 'line-clamp-3')}>{contribution.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/[0.07] pt-4 text-xs text-[#77736d]">
        <span className="text-[#b9b2a7]">{project?.name}</span>
        <span className="flex items-center gap-1.5"><Clock3 size={12} />{formatDate(contribution.date)}</span>
      </div>
    </article>
  )
}
