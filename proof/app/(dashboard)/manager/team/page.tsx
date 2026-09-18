'use client'

import Link from 'next/link'
import { getInitials } from '@/lib/utils'

export default function TeamPage() {
  const team = [
    {
      id: 'maya',
      name: 'Maya Chen',
      title: 'Senior Product Engineer',
      stats: { contributions: 42, projects: 4 },
      skills: ['React', 'System Design', 'TypeScript'],
      recentActivity: 'Implemented Pricing UI'
    },
    {
      id: 'daniel',
      name: 'Daniel Kim',
      title: 'Backend Engineer',
      stats: { contributions: 38, projects: 3 },
      skills: ['Go', 'GraphQL', 'PostgreSQL'],
      recentActivity: 'Finalized GraphQL schema'
    },
    {
      id: 'alex',
      name: 'Alex Johnson',
      title: 'Product Designer',
      stats: { contributions: 29, projects: 5 },
      skills: ['Figma', 'User Research', 'Prototyping'],
      recentActivity: 'Shared user research findings'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-100">Your Team</h1>
        <p className="text-zinc-500 mt-1">{team.length} members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((member) => (
          <Link href={`/manager/employees/${member.id}`} key={member.id}>
            <div className="border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] transition-colors rounded-xl p-6 h-full flex flex-col gap-6 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center font-medium text-xl shrink-0">
                  {getInitials(member.name)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-zinc-100">{member.name}</h2>
                  <p className="text-sm text-zinc-500">{member.title}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0F0F10] border border-[#27272A] rounded-lg p-3 text-center">
                  <p className="text-xl font-semibold text-zinc-100">{member.stats.contributions}</p>
                  <p className="text-xs text-zinc-500">Contributions</p>
                </div>
                <div className="bg-[#0F0F10] border border-[#27272A] rounded-lg p-3 text-center">
                  <p className="text-xl font-semibold text-zinc-100">{member.stats.projects}</p>
                  <p className="text-xs text-zinc-500">Projects</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Top Skills</p>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill) => (
                    <span key={skill} className="text-xs px-2.5 py-1 rounded-md bg-[#1A1A1D] border border-[#27272A] text-zinc-400">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-[#27272A]">
                <p className="text-xs text-zinc-500 mb-1">Recent Activity</p>
                <p className="text-sm text-zinc-300">{member.recentActivity}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
