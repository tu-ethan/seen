'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { INITIAL_WORKSPACE_STATE, MAYA } from '@/lib/fixtures'
import { activeContributions, buildSkillRecords } from '@/lib/product'
import type { Contribution, SkillRecord, WorkspaceState } from '@/types'

interface SeenContextValue extends WorkspaceState {
  allVisibleContributions: Contribution[]
  visibleContributions: Contribution[]
  skills: SkillRecord[]
}

const SeenContext = createContext<SeenContextValue | null>(null)

export function SeenProvider({ children }: { children: ReactNode }) {
  const value = useMemo<SeenContextValue>(() => {
    const contributions = INITIAL_WORKSPACE_STATE.contributions
    const allVisibleContributions = activeContributions(contributions)
    const visibleContributions = allVisibleContributions.filter((contribution) => contribution.employeeId === MAYA.id)

    return {
      contributions,
      allVisibleContributions,
      visibleContributions,
      skills: buildSkillRecords(visibleContributions),
    }
  }, [])

  return <SeenContext.Provider value={value}>{children}</SeenContext.Provider>
}

export function useSeen() {
  const context = useContext(SeenContext)
  if (!context) throw new Error('useSeen must be used inside SeenProvider')
  return context
}
