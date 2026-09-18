import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ContributionType } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatRelative(date: string | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return formatDate(date)
}

export function contributionTypeColor(type: ContributionType): string {
  const map: Record<ContributionType, string> = {
    EXECUTION: 'bg-violet-500/15 text-violet-300 border-violet-500/25',
    RESEARCH: 'bg-blue-500/15 text-blue-300 border-blue-500/25',
    IDEATION: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    OWNERSHIP: 'bg-orange-500/15 text-orange-300 border-orange-500/25',
    COLLABORATION: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    LEADERSHIP: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  }
  return map[type]
}

export function contributionTypeLabel(type: ContributionType): string {
  return type.charAt(0) + type.slice(1).toLowerCase()
}

export function confidenceLabel(confidence: number): 'High' | 'Medium' | 'Low' {
  if (confidence >= 0.9) return 'High'
  if (confidence >= 0.75) return 'Medium'
  return 'Low'
}

export function getInitials(name: string): string {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}
