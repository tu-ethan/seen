'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Equal, LayoutDashboard, Users, Video, Briefcase, LogOut, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarProps {
  role: 'manager' | 'employee'
}

const managerNav = [
  { label: 'Overview', href: '/manager', icon: LayoutDashboard },
  { label: 'Team', href: '/manager/team', icon: Users },
  { label: 'Meetings', href: '/manager/meetings', icon: Video },
]

const employeeNav = [
  { label: 'My Work', href: '/employee', icon: LayoutDashboard },
  { label: 'Contributions', href: '/employee/contributions', icon: Briefcase },
]

const demoUsers: Record<string, { name: string; initials: string; title: string; color: string }> = {
  manager: { name: 'Jordan Lee', initials: 'JL', title: 'Engineering Manager', color: 'bg-violet-500/20 text-violet-300' },
  maya: { name: 'Maya Chen', initials: 'MC', title: 'Senior Product Engineer', color: 'bg-blue-500/20 text-blue-300' },
  daniel: { name: 'Daniel Park', initials: 'DP', title: 'Software Engineer', color: 'bg-emerald-500/20 text-emerald-300' },
  alex: { name: 'Alex Rivera', initials: 'AR', title: 'Product Manager', color: 'bg-amber-500/20 text-amber-300' },
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const nav = role === 'manager' ? managerNav : employeeNav

  // Get demo user from cookie (client-side)
  const getCookieUser = () => {
    if (typeof document === 'undefined') return null
    const match = document.cookie.match(/proof_demo_user=([^;]+)/)
    return match ? match[1] : null
  }

  const demoUserKey = getCookieUser() ?? role
  const user = demoUsers[demoUserKey] ?? demoUsers.manager

  const isActive = (href: string) => {
    if (href === '/manager' || href === '/employee') return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full border-r border-[#1E1E21] bg-[#0F0F10]">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-[#1E1E21]">
        <div className="flex items-center gap-2">
          <Equal size={18} className="text-violet-400" strokeWidth={2.5} />
          <span className="text-base font-semibold tracking-tight text-zinc-100">PROOF</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {nav.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
              isActive(href)
                ? 'bg-[#1A1A1D] text-zinc-100 font-medium'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-[#141416]'
            )}
          >
            <Icon size={15} className={isActive(href) ? 'text-violet-400' : ''} />
            {label}
          </Link>
        ))}
      </nav>

      {/* User info + logout */}
      <div className="px-2 py-3 border-t border-[#1E1E21] space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0', user.color)}>
            {user.initials}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{user.name}</p>
            <p className="text-xs text-zinc-600 truncate">{user.title}</p>
          </div>
        </div>

        <Link
          href="/api/auth/logout"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:bg-[#141416] transition-colors"
          onClick={() => { document.cookie = 'proof_demo_user=; path=/; max-age=0' }}
        >
          <LogOut size={13} />
          Sign out
        </Link>
      </div>
    </aside>
  )
}
