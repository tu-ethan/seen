import type { ReactNode } from 'react'

export default function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="flex flex-col gap-5 border-b border-white/[0.08] pb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-serif text-4xl leading-none tracking-[-0.03em] text-[#f4efe6] sm:text-5xl">{title}</h1>
        {description && <p className="mt-4 max-w-2xl text-sm leading-6 text-[#958f86] sm:text-base">{description}</p>}
      </div>
      {action}
    </header>
  )
}
