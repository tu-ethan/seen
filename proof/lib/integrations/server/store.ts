import 'server-only'
import { INITIAL_WORKSPACE_STATE } from '@/lib/fixtures'
import type { Contribution, GoogleMeetConnection } from '@/types'

interface SeenServerState {
  contributions: Contribution[]
  googleMeet: GoogleMeetConnection
  processedEventIds: string[]
}

const initialState = (): SeenServerState => ({
  contributions: structuredClone(INITIAL_WORKSPACE_STATE.contributions),
  googleMeet: {
    connected: false,
    mode: process.env.GOOGLE_MEET_ACCESS_TOKEN?.startsWith('mock-') === false ? 'live' : 'mock',
    availableSeries: [],
  },
  processedEventIds: [],
})

const globalStore = globalThis as typeof globalThis & { __seenServerState?: SeenServerState }

export const getServerState = () => {
  globalStore.__seenServerState ??= initialState()
  return globalStore.__seenServerState
}

export function resetServerState() {
  globalStore.__seenServerState = initialState()
  return globalStore.__seenServerState
}

export function upsertContributions(contributions: Contribution[]) {
  const state = getServerState()
  contributions.forEach((contribution) => {
    const index = state.contributions.findIndex((item) => item.id === contribution.id)
    if (index >= 0) state.contributions[index] = contribution
    else state.contributions.unshift(contribution)
  })
  return contributions
}

export function updateContribution(id: string, update: Partial<Contribution>) {
  const state = getServerState()
  const index = state.contributions.findIndex((item) => item.id === id)
  if (index < 0) return null
  const current = state.contributions[index]
  const updated: Contribution = {
    ...current,
    ...update,
    id: current.id,
    employeeId: current.employeeId,
    status: 'EDITED',
  }
  state.contributions[index] = updated
  return updated
}

export function deleteContribution(id: string) {
  const state = getServerState()
  const index = state.contributions.findIndex((item) => item.id === id)
  if (index < 0) return false
  state.contributions.splice(index, 1)
  return true
}
