import Link from 'next/link'
import { PROJECTS } from '@/lib/fixtures'
import type { Contribution } from '@/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const COLORS = {
  rust: 'bg-[#b96748] shadow-[0_0_16px_rgba(185,103,72,0.22)]',
  green: 'bg-[#6f9b90] shadow-[0_0_16px_rgba(111,155,144,0.2)]',
  sand: 'bg-[#b6925f] shadow-[0_0_16px_rgba(182,146,95,0.2)]',
  lilac: 'bg-[#9b82df] shadow-[0_0_16px_rgba(155,130,223,0.22)]',
  blue: 'bg-[#6f86ad] shadow-[0_0_16px_rgba(111,134,173,0.2)]',
}

export default function AnnualProjectTimeline({ contributions }: { contributions: Contribution[] }) {
  const projects = PROJECTS.filter((project) => contributions.some((item) => item.projectId === project.id))

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-white/[0.08] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-7">
        <div><p className="eyebrow">2026 project activity</p><h2 className="mt-2 font-serif text-3xl text-[#eee7dc]">Where your work moved through the year</h2></div>
        <p className="text-xs text-[#716a63]">Each highlighted month has source-linked contributions</p>
      </div>
      <div className="overflow-x-auto p-5 sm:p-7">
        <div className="min-w-[880px]">
          <div className="grid grid-cols-[210px_repeat(12,minmax(44px,1fr))] gap-2 border-b border-white/[0.07] pb-3">
            <span className="text-[10px] uppercase tracking-[0.15em] text-[#625d57]">Project</span>
            {MONTHS.map((month) => <span key={month} className="text-center text-[10px] uppercase tracking-[0.12em] text-[#625d57]">{month}</span>)}
          </div>
          <div className="divide-y divide-white/[0.06]">
            {projects.map((project) => {
              const projectWork = contributions.filter((item) => item.projectId === project.id)
              const monthCounts = MONTHS.map((_, index) => projectWork.filter((item) => Number(item.date.slice(5, 7)) === index + 1).length)
              return (
                <div key={project.id} className="grid grid-cols-[210px_repeat(12,minmax(44px,1fr))] items-center gap-2 py-4">
                  <Link href={`/employee/projects/${project.id}`} className="group pr-4"><span className="block text-sm text-[#cfc7bc] transition group-hover:text-[#d6c9f6]">{project.name}</span><span className="mt-0.5 block truncate text-[11px] text-[#6f6962]">{project.shortName}</span></Link>
                  {monthCounts.map((count, index) => (
                    <div key={`${project.id}-${MONTHS[index]}`} className="flex h-8 items-center justify-center rounded-lg bg-white/[0.025]" aria-label={`${project.name}, ${MONTHS[index]}: ${count} contributions`}>
                      {count > 0 && <span className={`flex h-3.5 w-[78%] items-center justify-center rounded-full ${COLORS[project.accent]}`}>{count > 1 && <span className="text-[9px] font-bold text-[#15120f]">{count}</span>}</span>}
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
