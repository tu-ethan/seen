import type { Metadata } from 'next'
import { SeenProvider } from '@/components/app/SeenProvider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Seen · Ares Frontier',
  description: 'An evidence-backed record of work, growth, and impact.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning><SeenProvider>{children}</SeenProvider></body>
    </html>
  )
}
