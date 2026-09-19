import Link from 'next/link'
import { PROJECTS } from '@/lib/fixtures'
import type { Contribution, Project } from '@/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS: Record<Project['accent'], { bar: string; dot: string }> = {
  rust: { bar: 'border-[#c37355]/70 bg-[#c37355]/75 text-[#1b100c]', dot: 'bg-[#c37355]' },
  green: { bar: 'border-[#78a89c]/70 bg-[#78a89c]/75 text-[#0d1715]', dot: 'bg-[#78a89c]' },
  sand: { bar: 'border-[#c29b63]/70 bg-[#c29b63]/75 text-[#1a1309]', dot: 'bg-[#c29b63]' },
  lilac: { bar: 'border-[#a78ae9]/70 bg-[#a78ae9]/75 text-[#15101f]', dot: 'bg-[#a78ae9]' },
  blue: { bar: 'border-[#7894c4]/70 bg-[#7894c4]/75 text-[#0d121b]', dot: 'bg-[#7894c4]' },
}

export default function AnnualProjectTimeline({ contributions }: { contributions: Contribution[] }) {
  const projects = PROJECTS.filter((project) => contributions.some((item) => item.projectId === project.id))

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div><p className="eyebrow">2026 project activity</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Contributions by project</h2></div>
        <p className="max-w-xs text-xs leading-5 text-[#716a63]">A colored month means Seen captured at least one contribution toward that project.</p>
      </div>

      <div className="overflow-x-auto p-5 sm:p-7">
        <div className="min-w-[850px]">
          <div className="grid grid-cols-[220px_repeat(12,minmax(42px,1fr))] gap-1.5 border-b border-white/[0.07] pb-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#625d57]">Project</span>
            {MONTHS.map((month) => <span key={month} className="text-center text-[10px] uppercase tracking-[0.12em] text-[#625d57]">{month}</span>)}
          </div>

          <div className="divide-y divide-white/[0.06]">
            {projects.map((project) => {
              const projectWork = contributions.filter((item) => item.projectId === project.id)
              const monthCounts = MONTHS.map((_, index) => projectWork.filter((item) => Number(item.date.slice(5, 7)) === index + 1).length)
              const color = COLORS[project.accent]
              return (
                <div key={project.id} className="grid grid-cols-[220px_repeat(12,minmax(42px,1fr))] items-center gap-1.5 py-4">
                  <Link href={`/employee/projects/${project.id}`} className="group pr-5">
                    <span className="flex items-center gap-2 text-sm text-[#cfc7bc] transition group-hover:text-[#e0d5ca]"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color.dot}`} />{project.name}</span>
                    <span className="mt-1 block pl-[18px] text-[11px] text-[#6f6962]">{projectWork.length} contributions this year</span>
                  </Link>

                  {monthCounts.map((count, index) => (
                    <div key={`${project.id}-${MONTHS[index]}`} className="flex h-9 items-center" aria-label={`${project.name}, ${MONTHS[index]}: ${count} contributions`}>
                      {count > 0 && (
                        <span title={`${count} ${count === 1 ? 'contribution' : 'contributions'}`} className={`flex h-7 w-full items-center justify-center rounded-md border text-[10px] font-bold ${color.bar}`}>
                          {count}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
