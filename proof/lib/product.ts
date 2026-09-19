import { PROJECTS, SCHEDULED_MEETING, SKILL_NARRATIVES, TEAM_MEMBERS } from '@/lib/fixtures'
import type { Contribution, SkillRecord } from '@/types'

export const projectById = (projectId: string) => PROJECTS.find((project) => project.id === projectId)
export const employeeById = (employeeId: string) => TEAM_MEMBERS.find((employee) => employee.id === employeeId)

export const activeContributions = (contributions: Contribution[]) =>
  contributions.filter((contribution) => contribution.status !== 'DISMISSED').sort((a, b) => b.date.localeCompare(a.date))

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${date}T12:00:00`))

export const statusLabel = (status: Contribution['status']) => ({
  AI_CAPTURED: 'Seen captured', NEEDS_REVIEW: 'Evidence linked', VERIFIED: 'Evidence linked', EDITED: 'Evidence linked', DISMISSED: 'Hidden',
})[status]

export function buildSkillRecords(contributions: Contribution[]): SkillRecord[] {
  const skills = new Map<string, Contribution[]>()
  activeContributions(contributions).forEach((contribution) => contribution.skills.forEach((skill) => {
    skills.set(skill, [...(skills.get(skill) ?? []), contribution])
  }))

  return [...skills.entries()].map(([name, evidence]) => ({
    name,
    firstDemonstrated: [...evidence].sort((a, b) => a.date.localeCompare(b.date))[0].date,
    projectIds: [...new Set(evidence.map((item) => item.projectId))],
    meetingCount: new Set(evidence.map((item) => item.meetingId)).size,
    examples: [...evidence].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    narrative: SKILL_NARRATIVES[name] ?? `${name} is supported by recurring, meeting-based evidence in this employee’s shared work.`,
  })).sort((a, b) => b.meetingCount - a.meetingCount || a.name.localeCompare(b.name))
}

export const meetingTitle = (meetingId: string) => meetingId === SCHEDULED_MEETING.id
  ? SCHEDULED_MEETING.title
  : meetingId.split('-').slice(0, -3).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ')
