'use client'

import { useEffect, useState } from 'react'
import { Clock3, LoaderCircle, Mail, Pencil, Save, Trash2, Video, X } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import { categoryLabel } from '@/components/dashboard/ContributionCard'
import { contributionSource, formatDate, projectById, sourceProviderLabel } from '@/lib/product'
import type { Contribution, ContributionCategory } from '@/types'

const CATEGORIES: ContributionCategory[] = ['IMPROVED', 'SHIPPED', 'UNBLOCKED', 'RESEARCHED', 'MENTORED', 'LED']

export default function EvidenceDrawer({ item, onClose }: { item: Contribution | null; onClose: () => void }) {
  const { updateContribution, deleteContribution } = useSeen()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({ category: 'IMPROVED' as ContributionCategory, title: '', description: '', quote: '', speaker: '', timestamp: '' })

  useEffect(() => {
    if (!item) return
    const evidence = item.evidence[0] ?? { quote: '', speaker: '', timestamp: '' }
    setForm({ category: item.category, title: item.title, description: item.description, ...evidence })
    setEditing(false)
    setError(null)
  }, [item])

  if (!item) return null
  const project = projectById(item.projectId)
  const source = contributionSource(item)
  const SourceIcon = source.provider === 'OUTLOOK' ? Mail : Video

  const save = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateContribution(item.id, {
        category: form.category,
        title: form.title,
        description: form.description,
        evidence: [{ quote: form.quote, speaker: form.speaker, timestamp: form.timestamp }],
      })
      setEditing(false)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save evidence.')
    } finally { setSaving(false) }
  }

  const remove = async () => {
    if (!window.confirm('Delete this evidence from your record? This cannot be undone.')) return
    setSaving(true)
    setError(null)
    try {
      await deleteContribution(item.id)
      onClose()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not delete evidence.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Close evidence" className="absolute inset-0 h-full w-full bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <aside className="animate-drawer absolute right-0 top-0 flex h-full w-full max-w-[560px] flex-col border-l border-white/10 bg-[#11100f] shadow-2xl">
        <header className="flex items-start justify-between border-b border-white/[0.08] px-6 py-5 sm:px-8">
          <div><p className="eyebrow">Source evidence</p><div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.03] px-3 py-1.5 text-xs text-[#aaa29a]"><SourceIcon size={13} />{sourceProviderLabel(item)}</div></div>
          <div className="flex items-center gap-2"><button onClick={() => setEditing((current) => !current)} className="secondary-button px-3 py-2"><Pencil size={14} />{editing ? 'Cancel' : 'Edit'}</button><button onClick={remove} disabled={saving} className="danger-button px-3 py-2"><Trash2 size={14} />Delete</button><button aria-label="Close drawer" onClick={onClose} className="icon-button"><X size={18} /></button></div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-7 sm:px-8">
          {error && <p role="alert" className="mb-5 rounded-xl border border-[#914f3b]/25 bg-[#914f3b]/[0.07] px-4 py-3 text-sm text-[#d99c89]">{error}</p>}
          {editing ? <div className="space-y-4"><label className="block"><span className="eyebrow">Contribution type</span><select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as ContributionCategory }))} className="field mt-2">{CATEGORIES.map((category) => <option key={category} value={category}>{categoryLabel(category)}</option>)}</select></label><label className="block"><span className="eyebrow">Title</span><input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="field mt-2" /></label><label className="block"><span className="eyebrow">Description</span><textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="field mt-2 resize-y" /></label></div> : <><p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#b39a8e]">{categoryLabel(item.category)}</p><h2 className="mt-3 font-serif text-3xl leading-tight text-[#f4efe6]">{item.title}</h2><p className="mt-4 leading-7 text-[#aaa49a]">{item.description}</p></>}

          <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-white/[0.08] py-5 text-sm">
            <div><dt className="text-xs text-[#716c65]">Project</dt><dd className="mt-1 text-[#d4cec4]">{project?.name}</dd></div>
            <div><dt className="text-xs text-[#716c65]">Captured</dt><dd className="mt-1 text-[#d4cec4]">{formatDate(item.date)}</dd></div>
            <div className="col-span-2"><dt className="text-xs text-[#716c65]">Source</dt><dd className="mt-1 text-[#d4cec4]">{source.title}</dd>{source.sender && <dd className="mt-1 text-xs text-[#777169]">Sent by {source.sender}</dd>}</div>
          </dl>

          <section className="mt-8">
            <p className="eyebrow">{source.kind === 'EMAIL' ? 'Email evidence' : 'What Maya said'}</p>
            {editing ? <div className="mt-3 space-y-4"><label className="block"><span className="text-xs text-[#716c65]">Supporting quote</span><textarea rows={5} value={form.quote} onChange={(event) => setForm((current) => ({ ...current, quote: event.target.value }))} className="field mt-2 resize-y" /></label><div className="grid grid-cols-2 gap-3"><label><span className="text-xs text-[#716c65]">Speaker</span><input value={form.speaker} onChange={(event) => setForm((current) => ({ ...current, speaker: event.target.value }))} className="field mt-2" /></label><label><span className="text-xs text-[#716c65]">Timestamp</span><input value={form.timestamp} onChange={(event) => setForm((current) => ({ ...current, timestamp: event.target.value }))} className="field mt-2" /></label></div><button onClick={save} disabled={saving || !form.title.trim() || !form.description.trim() || !form.quote.trim() || !form.speaker.trim() || !form.timestamp.trim()} className="primary-button w-full">{saving ? <LoaderCircle size={15} className="animate-spin" /> : <Save size={15} />}Save evidence</button></div> : <div className="mt-3 space-y-3">
              {item.evidence.map((evidence) => (
                <blockquote key={`${evidence.timestamp}-${evidence.quote}`} className="rounded-2xl border border-[#8d72d8]/25 bg-[#8d72d8]/[0.07] p-5">
                  <p className="font-serif text-lg leading-7 text-[#e5ded3]">“{evidence.quote}”</p>
                  <footer className="mt-4 flex items-center gap-2 text-xs text-[#8f897f]"><Clock3 size={12} />{evidence.timestamp} · {evidence.speaker}</footer>
                </blockquote>
              ))}
            </div>}
          </section>

          <section className="mt-8"><p className="eyebrow">Skills demonstrated</p><div className="mt-3 flex flex-wrap gap-2">{item.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)}</div></section>
        </div>
      </aside>
    </div>
  )
}
