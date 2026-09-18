import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const demoUser = cookieStore.get('proof_demo_user')?.value

  // Determine role from demo cookie
  const isManager = demoUser === 'manager'
  const role = isManager ? 'manager' : 'employee'

  return (
    <div className="flex h-screen bg-[#0F0F10] overflow-hidden">
      <Sidebar role={role} />
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
