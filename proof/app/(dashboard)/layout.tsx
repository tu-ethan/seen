import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:pl-[260px]">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
