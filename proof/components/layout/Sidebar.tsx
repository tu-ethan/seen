'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, FileText, FolderKanban, Home, Sparkles, UserRoundCog } from 'lucide-react'
import { JORDAN, MAYA } from '@/lib/fixtures'
import { cn } from '@/lib/utils'

const employeeNav = [
  { label: 'Home', href: '/employee', icon: Home },
  { label: 'Impact', href: '/employee/contributions', icon: Activity },
  { label: 'Projects', href: '/employee/projects', icon: FolderKanban },
  { label: 'Skills', href: '/employee/skills', icon: Sparkles },
  { label: 'Review Brief', href: '/employee/review', icon: FileText },
]

const managerNav = [{ label: 'Team records', href: '/manager', icon: UserRoundCog }]

export default function Sidebar() {
  const pathname = usePathname()
  const managerView = pathname.startsWith('/manager')
  const nav = managerView ? managerNav : employeeNav
  const person = managerView ? JORDAN : MAYA

  const active = (href: string) => href === '/employee' || href === '/manager' ? pathname === href : pathname.startsWith(href)
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/[0.08] bg-[#0e0d0c]/95 px-4 backdrop-blur-xl md:flex">
        <div className="border-b border-white/[0.08] px-2 py-7">
          <Link href={managerView ? '/manager' : '/employee'} className="inline-flex items-center gap-3">
            <span className="seen-mark"><span /></span>
            <span className="font-serif text-2xl tracking-[-0.03em] text-[#f4efe6]">Seen</span>
          </Link>
          <p className="mt-3 text-[11px] uppercase tracking-[0.12em] text-[#68635c]">Ares Frontier · Sample workspace</p>
        </div>

        <nav className="flex-1 space-y-1 py-6">
          {nav.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={cn('nav-link', active(href) && 'nav-link-active')}>
              <Icon size={16} />{label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/[0.08] py-4">
          <Link href={managerView ? '/employee' : '/manager'} className="flex items-center gap-3 rounded-xl border border-white/[0.08] p-3 transition hover:border-[#a98cf5]/35 hover:bg-white/[0.03]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#8d72d8]/15 text-xs font-semibold text-[#c9baf2]">{person.initials}</span>
            <span className="min-w-0"><span className="block truncate text-sm text-[#d8d1c7]">{person.name}</span><span className="block truncate text-xs text-[#716b64]">{person.title}</span></span>
          </Link>
          <Link href={managerView ? '/employee' : '/manager'} className="mt-2 block px-3 text-[11px] text-[#817b72] hover:text-[#b8a1f4]">
            {managerView ? 'Return to Maya’s workspace' : 'View manager workspace'}
          </Link>
        </div>
      </aside>

      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#0e0d0c]/95 px-5 backdrop-blur-xl md:hidden">
        <Link href={managerView ? '/manager' : '/employee'} className="flex items-center gap-2"><span className="seen-mark seen-mark-small"><span /></span><span className="font-serif text-xl text-[#f4efe6]">Seen</span></Link>
        <Link href={managerView ? '/employee' : '/manager'} className="text-xs text-[#9c948a]">{managerView ? 'Maya view' : 'Manager view'}</Link>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-[70px] items-center gap-1 overflow-x-auto border-t border-white/[0.08] bg-[#0e0d0c]/95 px-2 backdrop-blur-xl md:hidden">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={cn('flex min-w-[72px] flex-1 flex-col items-center gap-1.5 rounded-xl px-2 py-2 text-[10px] text-[#777169]', active(href) && 'bg-white/[0.06] text-[#d8cec3]')}>
            <Icon size={17} className={active(href) ? 'text-[#b8a1f4]' : ''} />{label}
          </Link>
        ))}
      </nav>
    </>
  )
}
