import { Check, PenLine, Sparkles, TriangleAlert, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { statusLabel } from '@/lib/product'
import type { ContributionStatus } from '@/types'

const CONFIG: Record<ContributionStatus, { icon: typeof Check; classes: string }> = {
  AI_CAPTURED: { icon: Sparkles, classes: 'border-[#8d72d8]/40 bg-[#8d72d8]/10 text-[#c9baf2]' },
  NEEDS_REVIEW: { icon: TriangleAlert, classes: 'border-[#52796f]/50 bg-[#52796f]/10 text-[#a9cdc4]' },
  VERIFIED: { icon: Check, classes: 'border-[#52796f]/50 bg-[#52796f]/10 text-[#a9cdc4]' },
  EDITED: { icon: PenLine, classes: 'border-[#6c7691]/45 bg-[#6c7691]/10 text-[#b9c4dc]' },
  DISMISSED: { icon: X, classes: 'border-white/10 bg-white/[0.04] text-[#77736d]' },
}

export default function StatusBadge({ status, className }: { status: ContributionStatus; className?: string }) {
  const config = CONFIG[status]
  const Icon = config.icon
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', config.classes, className)}>
      <Icon size={11} />{statusLabel(status)}
    </span>
  )
}
