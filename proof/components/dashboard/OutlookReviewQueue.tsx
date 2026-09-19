'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Edit3, Inbox, LoaderCircle, Mail, RefreshCw, Save, Trash2, X } from 'lucide-react'

interface OutlookDraft {
  id: string
  type: string
  title: string
  description: string
  evidenceExcerpt: string
  confidence: number
  sourceTimestamp: string
  sourceEmailSubject: string
  status: 'DRAFT' | 'APPROVED' | 'DISMISSED'
}

export default function OutlookReviewQueue() {
  const [items, setItems] = useState<OutlookDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/contributions/outlook?status=DRAFT', { cache: 'no-store' })
      const payload = await response.json() as { contributions?: OutlookDraft[]; error?: string }
      if (!response.ok) throw new Error(payload.error || 'Could not load Outlook drafts.')
      setItems(payload.contributions ?? [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Outlook drafts.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { void load() }, [load])

  const update = async (item: OutlookDraft, action: 'approve' | 'dismiss' | 'edit') => {
    setBusyId(item.id)
    setError(null)
    try {
      const response = await fetch(`/api/contributions/outlook/${encodeURIComponent(item.id)}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...(action === 'edit' ? { title, description } : {}) }),
      })
      const payload = await response.json() as { contribution?: OutlookDraft; error?: string }
      if (!response.ok || !payload.contribution) throw new Error(payload.error || 'Could not update this draft.')
      if (action === 'edit') {
        setItems((current) => current.map((entry) => entry.id === item.id ? payload.contribution as OutlookDraft : entry))
        setEditingId(null)
      } else {
        setItems((current) => current.filter((entry) => entry.id !== item.id))
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : 'Could not update this draft.')
    } finally { setBusyId(null) }
  }

  const beginEdit = (item: OutlookDraft) => { setEditingId(item.id); setTitle(item.title); setDescription(item.description) }

  return (
    <section className="panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-white/[0.08] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div><div className="flex items-center gap-2"><Inbox size={16} className="text-[#b8a1f4]" /><p className="eyebrow">Private review queue</p></div><h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Outlook contribution drafts</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[#817a72]">Only you can see these drafts. A manager sees a contribution only after you approve it, and never sees the full email body.</p></div>
        <button onClick={() => void load()} disabled={loading} className="secondary-button shrink-0"><RefreshCw size={14} className={loading ? 'animate-spin' : ''} />Refresh</button>
      </div>

      {error && <p role="alert" className="border-b border-[#914f3b]/25 bg-[#914f3b]/[0.07] px-6 py-4 text-sm text-[#d99c89]">{error}</p>}
      {loading ? (
        <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-[#817a72]"><LoaderCircle size={16} className="animate-spin" />Loading private drafts</div>
      ) : items.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center"><Mail size={22} className="text-[#716a63]" /><p className="mt-4 text-sm text-[#aaa198]">No Outlook drafts need review.</p><p className="mt-1 text-xs text-[#6f6962]">Label a relevant email with the exact Outlook category “Seen,” then sync it from Connections.</p></div>
      ) : (
        <div className="divide-y divide-white/[0.07]">
          {items.map((item) => {
            const editing = editingId === item.id
            const busy = busyId === item.id
            return <article key={item.id} className="p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#777169]"><span className="rounded-full border border-[#8d72d8]/25 bg-[#8d72d8]/10 px-2.5 py-1 text-[#c5b5ed]">{item.type}</span><span>{Math.round(item.confidence * 100)}% confidence</span><span>·</span><time>{new Date(item.sourceTimestamp).toLocaleDateString()}</time></div>
              <p className="mt-3 flex items-center gap-2 text-xs text-[#817a72]"><Mail size={12} />{item.sourceEmailSubject}</p>
              {editing ? <div className="mt-4 space-y-3"><input aria-label="Contribution title" className="field" value={title} onChange={(event) => setTitle(event.target.value)} /><textarea aria-label="Contribution description" className="field min-h-28 resize-y" value={description} onChange={(event) => setDescription(event.target.value)} /></div> : <><h3 className="mt-3 font-serif text-xl text-[#e5ddd2]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[#958e85]">{item.description}</p></>}
              <blockquote className="mt-4 border-l-2 border-[#8d72d8]/45 pl-4 font-serif text-base leading-7 text-[#cfc5b9]">“{item.evidenceExcerpt}”</blockquote>
              <div className="mt-5 flex flex-wrap gap-2">
                {editing ? <><button onClick={() => void update(item, 'edit')} disabled={busy || !title.trim() || !description.trim()} className="primary-button"><Save size={14} />Save edit</button><button onClick={() => setEditingId(null)} disabled={busy} className="secondary-button"><X size={14} />Cancel</button></> : <><button onClick={() => void update(item, 'approve')} disabled={busy} className="primary-button"><Check size={14} />Approve</button><button onClick={() => beginEdit(item)} disabled={busy} className="secondary-button"><Edit3 size={14} />Edit</button><button onClick={() => void update(item, 'dismiss')} disabled={busy} className="danger-button"><Trash2 size={14} />Dismiss</button></>}
              </div>
            </article>
          })}
        </div>
      )}
    </section>
  )
}
