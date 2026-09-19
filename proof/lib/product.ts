import { PROJECTS, SCHEDULED_MEETING, SKILL_NARRATIVES, TEAM_MEMBERS } from '@/lib/fixtures'
import type { Contribution, EvidenceSource, SkillRecord } from '@/types'

export const projectById = (projectId: string) => PROJECTS.find((project) => project.id === projectId)
export const employeeById = (employeeId: string) => TEAM_MEMBERS.find((employee) => employee.id === employeeId)

export const activeContributions = (contributions: Contribution[]) =>
  contributions.filter((contribution) => contribution.status !== 'DISMISSED').sort((a, b) => b.date.localeCompare(a.date))

export const formatDate = (date: string, options?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-US', options ?? { month: 'short', day: 'numeric', year: 'numeric' })
    .format(new Date(`${date}T12:00:00`))

export const statusLabel = (status: Contribution['status']) => ({
  DRAFT: 'Needs your review', APPROVED: 'Approved', AI_CAPTURED: 'Seen captured', NEEDS_REVIEW: 'Evidence linked', VERIFIED: 'Evidence linked', EDITED: 'Evidence linked', DISMISSED: 'Hidden',
})[status]

export const meetingTitle = (meetingId?: string) => {
  if (!meetingId) return 'Source document'
  return meetingId === SCHEDULED_MEETING.id
    ? SCHEDULED_MEETING.title
    : meetingId.split('-').slice(0, -3).map((word) => word[0]?.toUpperCase() + word.slice(1)).join(' ')
}

export const contributionSource = (contribution: Contribution): EvidenceSource => contribution.source ?? {
  provider: 'GOOGLE_MEET',
  kind: 'MEETING_TRANSCRIPT',
  title: meetingTitle(contribution.meetingId),
  occurredAt: `${contribution.date}T12:00:00`,
  externalId: contribution.meetingId ?? contribution.id,
}

export const sourceProviderLabel = (contribution: Contribution) =>
  contributionSource(contribution).provider === 'OUTLOOK' ? 'Outlook email' : 'Google Meet'

export const daysAgoLabel = (date: string, referenceDate = '2026-09-19') => {
  const days = Math.max(0, Math.round((new Date(`${referenceDate}T12:00:00`).getTime() - new Date(`${date}T12:00:00`).getTime()) / 86_400_000))
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export function buildSkillRecords(contributions: Contribution[]): SkillRecord[] {
  const skills = new Map<string, Contribution[]>()
  activeContributions(contributions).forEach((contribution) => contribution.skills.forEach((skill) => {
    skills.set(skill, [...(skills.get(skill) ?? []), contribution])
  }))

  return [...skills.entries()].map(([name, evidence]) => ({
    name,
    firstDemonstrated: [...evidence].sort((a, b) => a.date.localeCompare(b.date))[0].date,
    projectIds: [...new Set(evidence.map((item) => item.projectId))],
    sourceCount: new Set(evidence.map((item) => contributionSource(item).externalId)).size,
    examples: [...evidence].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    narrative: SKILL_NARRATIVES[name] ?? `${name} is supported by recurring, source-linked evidence in this employee’s shared work.`,
  })).sort((a, b) => b.sourceCount - a.sourceCount || a.name.localeCompare(b.name))
}
