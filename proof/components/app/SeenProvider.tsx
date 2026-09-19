'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { INITIAL_WORKSPACE_STATE, MAYA } from '@/lib/fixtures'
import { activeContributions, buildSkillRecords } from '@/lib/product'
import type { Contribution, SkillRecord, WorkspaceState } from '@/types'

interface SeenContextValue extends WorkspaceState {
  allVisibleContributions: Contribution[]
  visibleContributions: Contribution[]
  skills: SkillRecord[]
  refreshContributions: () => Promise<void>
  updateContribution: (id: string, update: Partial<Pick<Contribution, 'category' | 'title' | 'description' | 'evidence'>>) => Promise<Contribution>
  deleteContribution: (id: string) => Promise<void>
}

const SeenContext = createContext<SeenContextValue | null>(null)

export function SeenProvider({ children }: { children: ReactNode }) {
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_WORKSPACE_STATE.contributions)

  const refreshContributions = useCallback(async () => {
    const response = await fetch('/api/contributions', { cache: 'no-store' })
    const payload = await response.json() as { contributions?: Contribution[]; error?: string }
    if (!response.ok || !payload.contributions) throw new Error(payload.error ?? 'Could not load contribution evidence')
    setContributions(payload.contributions)
  }, [])

  useEffect(() => { void refreshContributions() }, [refreshContributions])

  const updateContribution = useCallback(async (
    id: string,
    update: Partial<Pick<Contribution, 'category' | 'title' | 'description' | 'evidence'>>,
  ) => {
    const response = await fetch(`/api/contributions/${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(update),
    })
    const payload = await response.json() as { contribution?: Contribution; error?: string }
    if (!response.ok || !payload.contribution) throw new Error(payload.error ?? 'Could not update contribution evidence')
    setContributions((current) => current.map((item) => item.id === id ? payload.contribution! : item))
    return payload.contribution
  }, [])

  const deleteContribution = useCallback(async (id: string) => {
    const response = await fetch(`/api/contributions/${encodeURIComponent(id)}`, { method: 'DELETE' })
    if (!response.ok) {
      const payload = await response.json() as { error?: string }
      throw new Error(payload.error ?? 'Could not delete contribution evidence')
    }
    setContributions((current) => current.filter((item) => item.id !== id))
  }, [])

  const value = useMemo<SeenContextValue>(() => {
    const allVisibleContributions = activeContributions(contributions)
    const visibleContributions = allVisibleContributions.filter((contribution) => contribution.employeeId === MAYA.id)

    return {
      contributions,
      allVisibleContributions,
      visibleContributions,
      skills: buildSkillRecords(visibleContributions),
      refreshContributions,
      updateContribution,
      deleteContribution,
    }
  }, [contributions, deleteContribution, refreshContributions, updateContribution])

  return <SeenContext.Provider value={value}>{children}</SeenContext.Provider>
}

export function useSeen() {
  const context = useContext(SeenContext)
  if (!context) throw new Error('useSeen must be used inside SeenProvider')
  return context
}
