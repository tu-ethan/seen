'use client'

import Link from 'next/link'
import { Equal } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const loginAsDemo = (role: 'manager' | 'maya' | 'daniel' | 'alex') => {
    // Set demo session cookie and redirect
    document.cookie = `proof_demo_user=${role}; path=/; max-age=86400`
    if (role === 'manager') {
      router.push('/manager')
    } else {
      router.push('/employee')
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-10">

        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <Equal size={28} className="text-violet-400" strokeWidth={2.5} />
            <span className="text-3xl font-semibold tracking-tight text-zinc-100">PROOF</span>
          </div>
          <p className="text-zinc-500 text-sm leading-relaxed">
            Evidence-backed workplace contributions.<br />
            Every meeting, on the record.
          </p>
        </div>

        {/* Auth0 login */}
        <div className="space-y-3">
          <Link
            href="/api/auth/login"
            className="flex w-full items-center justify-center rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm px-4 py-3 transition-colors"
          >
            Sign in with Auth0
          </Link>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#27272A]" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-[#0F0F10] px-3 text-xs text-zinc-600">Demo access</span>
          </div>
        </div>

        {/* Demo users */}
        <div className="space-y-2">
          <p className="text-xs text-zinc-600 text-center mb-3">Click to enter without Auth0</p>
          <button
            onClick={() => loginAsDemo('manager')}
            className="w-full flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] px-4 py-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-semibold text-violet-300">JL</div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Jordan Lee</p>
              <p className="text-xs text-zinc-500">Engineering Manager</p>
            </div>
            <span className="ml-auto text-xs text-zinc-600 font-medium uppercase tracking-wide">Manager</span>
          </button>

          <button
            onClick={() => loginAsDemo('maya')}
            className="w-full flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] px-4 py-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-semibold text-blue-300">MC</div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Maya Chen</p>
              <p className="text-xs text-zinc-500">Senior Product Engineer</p>
            </div>
            <span className="ml-auto text-xs text-zinc-600 font-medium uppercase tracking-wide">Employee</span>
          </button>

          <button
            onClick={() => loginAsDemo('daniel')}
            className="w-full flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] px-4 py-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-xs font-semibold text-emerald-300">DP</div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Daniel Park</p>
              <p className="text-xs text-zinc-500">Software Engineer</p>
            </div>
            <span className="ml-auto text-xs text-zinc-600 font-medium uppercase tracking-wide">Employee</span>
          </button>

          <button
            onClick={() => loginAsDemo('alex')}
            className="w-full flex items-center gap-3 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#1A1A1D] hover:border-[#3F3F46] px-4 py-3 transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-semibold text-amber-300">AR</div>
            <div>
              <p className="text-sm font-medium text-zinc-200">Alex Rivera</p>
              <p className="text-xs text-zinc-500">Product Manager</p>
            </div>
            <span className="ml-auto text-xs text-zinc-600 font-medium uppercase tracking-wide">Employee</span>
          </button>
        </div>

        <p className="text-center text-xs text-zinc-700">
          PROOF · Hackathon MVP · {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
