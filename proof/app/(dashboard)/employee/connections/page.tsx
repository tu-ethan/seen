'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, ArrowRight, Check, Clock3, LoaderCircle, Mail, Radio, RefreshCw, ShieldCheck, Sparkles, Trash2, Video } from 'lucide-react'
import { useSeen } from '@/components/app/SeenProvider'
import PageHeader from '@/components/layout/PageHeader'
import { projectById } from '@/lib/product'
import type { GoogleMeetConnection } from '@/types'

interface OutlookStatus {
  configured: boolean
  missing: string[]
  connected: boolean
  status: string
  email: string | null
  lastSyncedAt: string | null
  subscriptionStatus: string | null
  subscriptionExpiresAt: string | null
}

interface SyncSummary { queued: number; processed: number; ignored: number; failed: number; completedAt: string }
interface ProcessingResult { duplicate: boolean; contributionIds: string[]; processedAt: string }
const EMPTY_GOOGLE: GoogleMeetConnection = { connected: false, mode: 'mock', availableSeries: [] }

export default function ConnectionsPage() {
  const { visibleContributions, refreshContributions } = useSeen()
  const [outlook, setOutlook] = useState<OutlookStatus | null>(null)
  const [google, setGoogle] = useState<GoogleMeetConnection>(EMPTY_GOOGLE)
  const [googleSeriesId, setGoogleSeriesId] = useState('')
  const [googleBusy, setGoogleBusy] = useState<'status' | 'connect' | 'subscribe' | 'simulate' | 'disconnect' | null>('status')
  const [googleResult, setGoogleResult] = useState<ProcessingResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<'sync' | 'disconnect' | 'delete' | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<SyncSummary | null>(null)

  const loadStatus = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/integrations/outlook', { cache: 'no-store' })
      const payload = await response.json() as OutlookStatus | { error?: string }
      if (!response.ok) throw new Error('error' in payload ? payload.error : 'Could not load Outlook status.')
      setOutlook(payload as OutlookStatus)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load Outlook status.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    void loadStatus()
    void fetch('/api/integrations/google-meet', { cache: 'no-store' })
      .then(async (response) => {
        const payload = await response.json() as GoogleMeetConnection
        setGoogle(payload)
        setGoogleSeriesId(payload.selectedSeries?.id ?? payload.availableSeries.find((item) => item.title === 'Weekly Contributions')?.id ?? payload.availableSeries[0]?.id ?? '')
      })
      .catch(() => setError('Could not load the Google Meet connection.'))
      .finally(() => setGoogleBusy(null))
  }, [loadStatus])

  const disconnect = async () => {
    setBusy('disconnect'); setError(null)
    try {
      const response = await fetch('/api/integrations/outlook', { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not disconnect Outlook.')
      await loadStatus()
      setResult(null)
    } catch (disconnectError) { setError(disconnectError instanceof Error ? disconnectError.message : 'Could not disconnect Outlook.') }
    finally { setBusy(null) }
  }

  const sync = async () => {
    setBusy('sync'); setError(null); setResult(null)
    try {
      const response = await fetch('/api/integrations/outlook/sync', { method: 'POST' })
      const payload = await response.json() as SyncSummary | { error?: string }
      if (!response.ok) throw new Error('error' in payload ? payload.error : 'Outlook sync failed.')
      setResult(payload as SyncSummary)
      await loadStatus()
    } catch (syncError) { setError(syncError instanceof Error ? syncError.message : 'Outlook sync failed.') }
    finally { setBusy(null) }
  }

  const deleteEvidence = async () => {
    setBusy('delete'); setError(null)
    try {
      const response = await fetch('/api/integrations/outlook/evidence', { method: 'DELETE' })
      if (!response.ok) throw new Error('Could not delete imported Outlook evidence.')
      setResult(null)
    } catch (deleteError) { setError(deleteError instanceof Error ? deleteError.message : 'Could not delete imported Outlook evidence.') }
    finally { setBusy(null) }
  }

  const googleRequest = async (path: string, options: RequestInit = {}) => {
    setError(null)
    const response = await fetch(path, options)
    const payload = response.status === 204 ? null : await response.json() as GoogleMeetConnection & { error?: string }
    if (!response.ok) throw new Error(payload?.error ?? 'The Google Meet integration request failed.')
    return payload
  }

  const connectGoogle = async () => {
    setGoogleBusy('connect')
    try {
      const payload = await googleRequest('/api/integrations/google-meet/connect', { method: 'POST' }) as GoogleMeetConnection
      setGoogle(payload)
      setGoogleSeriesId(payload.availableSeries.find((item) => item.title === 'Weekly Contributions')?.id ?? payload.availableSeries[0]?.id ?? '')
    } catch (connectError) { setError(connectError instanceof Error ? connectError.message : 'Could not connect Google.') }
    finally { setGoogleBusy(null) }
  }

  const disconnectGoogle = async () => {
    setGoogleBusy('disconnect')
    try {
      await googleRequest('/api/integrations/google-meet/connect', { method: 'DELETE' })
      setGoogle(EMPTY_GOOGLE); setGoogleSeriesId(''); setGoogleResult(null)
    } catch (disconnectError) { setError(disconnectError instanceof Error ? disconnectError.message : 'Could not disconnect Google.') }
    finally { setGoogleBusy(null) }
  }

  const subscribeGoogle = async () => {
    setGoogleBusy('subscribe')
    try {
      const payload = await googleRequest('/api/integrations/google-meet/subscription', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seriesId: googleSeriesId }),
      }) as GoogleMeetConnection
      setGoogle(payload)
    } catch (subscriptionError) { setError(subscriptionError instanceof Error ? subscriptionError.message : 'Could not subscribe to this meeting.') }
    finally { setGoogleBusy(null) }
  }

  const simulateGoogleTranscript = async () => {
    setGoogleBusy('simulate'); setGoogleResult(null)
    try {
      const payload = await googleRequest('/api/integrations/google-meet/simulate', { method: 'POST' }) as unknown as ProcessingResult
      await refreshContributions()
      setGoogleResult(payload)
      const response = await fetch('/api/integrations/google-meet', { cache: 'no-store' })
      setGoogle(await response.json() as GoogleMeetConnection)
    } catch (simulationError) { setError(simulationError instanceof Error ? simulationError.message : 'Could not process the mock transcript event.') }
    finally { setGoogleBusy(null) }
  }

  const reconnectRequired = outlook?.status === 'RECONNECT_REQUIRED' || outlook?.subscriptionStatus === 'MISSING'
  const generatedContributions = useMemo(() => googleResult?.contributionIds
    .map((id) => visibleContributions.find((contribution) => contribution.id === id))
    .filter((item) => item !== undefined) ?? [], [googleResult, visibleContributions])

  return (
    <div className="page-shell space-y-8">
      <PageHeader eyebrow="Settings · Integrations" title="Connections" description="Connect work sources without turning your inbox into a monitoring feed. You choose what Seen may process and what managers may see." />

      {error && <p role="alert" className="rounded-xl border border-[#914f3b]/30 bg-[#914f3b]/10 px-5 py-4 text-sm text-[#d99c89]">{error}</p>}

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="panel p-6 sm:p-7">
          <div className="flex items-start justify-between gap-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6f86ad]/35 bg-[#6f86ad]/[0.08] text-[#aebed8]"><Mail size={20} /></span>
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${outlook?.connected ? 'border-[#52796f]/35 bg-[#52796f]/[0.09] text-[#a7c9c0]' : 'border-white/[0.08] text-[#777169]'}`}>
              {loading ? <LoaderCircle size={11} className="animate-spin" /> : outlook?.connected ? <Check size={11} /> : null}
              {loading ? 'Checking' : outlook?.connected ? 'Connected' : outlook?.configured ? 'Not connected' : 'Unavailable'}
            </span>
          </div>
          <h2 className="mt-6 font-serif text-2xl text-[#eee7dc]">Outlook</h2>
          <p className="mt-2 max-w-lg text-sm font-medium leading-6 text-[#c7beb3]">Seen only processes messages you label with the Seen category. It does not scan your inbox.</p>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#817a72]">Delegated access is limited to your signed-in Microsoft account. Attachments are never retrieved or sent to Gemini.</p>
          <div className="mt-5 flex items-center gap-2 text-xs text-[#6f6962]"><ShieldCheck size={13} />Delegated, read-only scope · Mail.Read</div>

          {outlook?.connected && <div className="mt-5 rounded-xl border border-white/[0.08] bg-black/10 p-4 text-xs leading-5 text-[#8f887f]">
            <p className="text-[#c6bdb2]">Connected as {outlook.email}</p>
            <p className="mt-2">In Outlook, open Categories, create a category named exactly <strong className="text-[#d7cec3]">Seen</strong>, and apply it only to messages you want included in your private review queue.</p>
            <p className="mt-2 flex items-center gap-1.5"><Clock3 size={12} />Last sync: {outlook.lastSyncedAt ? new Date(outlook.lastSyncedAt).toLocaleString() : 'Not synced yet'}</p>
          </div>}

          {!loading && outlook && !outlook.configured && <div className="mt-5 rounded-xl border border-[#98784c]/30 bg-[#98784c]/10 p-4 text-xs leading-5 text-[#cdb68d]"><div className="flex items-center gap-2 font-medium"><AlertTriangle size={13} />Server credentials are not configured</div><p className="mt-1 text-[#9f9078]">The prepared product demo still works. An administrator must add the documented server environment variables before Outlook can connect.</p></div>}
          {reconnectRequired && <p className="mt-5 rounded-xl border border-[#914f3b]/30 bg-[#914f3b]/10 p-4 text-xs leading-5 text-[#d99c89]">Microsoft access or the mail subscription needs attention. Reconnect Outlook to resume private evidence capture.</p>}

          <div className="mt-6 flex flex-wrap gap-2">
            {outlook?.connected && !reconnectRequired ? <button onClick={() => void disconnect()} disabled={busy !== null} className="secondary-button">{busy === 'disconnect' && <LoaderCircle size={14} className="animate-spin" />}Disconnect Outlook</button> : <a href="/api/integrations/outlook/connect" aria-disabled={!outlook?.configured} className={`primary-button ${!outlook?.configured ? 'pointer-events-none opacity-50' : ''}`}>{reconnectRequired ? 'Reconnect Outlook' : 'Connect Outlook'}</a>}
            {outlook?.connected && <button onClick={() => void sync()} disabled={busy !== null || reconnectRequired} className="primary-button"><RefreshCw size={14} className={busy === 'sync' ? 'animate-spin' : ''} />Sync labeled emails now</button>}
          </div>
        </article>

        <article className="panel p-6 sm:p-7">
          <div className="flex items-start justify-between gap-5"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6f9b90]/35 bg-[#6f9b90]/[0.08] text-[#acd0c7]"><Video size={20} /></span><span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${google.connected ? 'border-[#52796f]/35 bg-[#52796f]/[0.09] text-[#a7c9c0]' : 'border-white/[0.08] text-[#777169]'}`}>{googleBusy === 'status' ? <LoaderCircle size={11} className="animate-spin" /> : google.connected && <Check size={11} />}{googleBusy === 'status' ? 'Checking' : google.connected ? 'Connected' : 'Not connected'}</span></div>
          <h2 className="mt-6 font-serif text-2xl text-[#eee7dc]">Google Meet</h2>
          <p className="mt-2 max-w-lg text-sm leading-6 text-[#989188]">Choose one recurring meeting. Seen listens for transcript-generated events and adds grounded evidence automatically.</p>
          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-[#6f6962]"><ShieldCheck size={13} />Calendar read-only · Meet read-only{google.accountEmail && <span>· {google.accountEmail}</span>}{google.mode === 'mock' && google.connected && <span className="text-[#b9a8e4]">· Mock credentials</span>}</div>

          {google.connected && <div className="mt-5 space-y-3">{google.availableSeries.map((series) => <label key={series.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${googleSeriesId === series.id ? 'border-[#a98cf5]/45 bg-[#a98cf5]/[0.06]' : 'border-white/[0.08] bg-black/10'}`}><input type="radio" name="google-meeting-series" checked={googleSeriesId === series.id} onChange={() => setGoogleSeriesId(series.id)} className="mt-1 accent-[#a98cf5]" /><span className="min-w-0 text-sm text-[#d4ccc2]">{series.title}{google.selectedSeries?.id === series.id && <span className="ml-2 rounded-full border border-[#52796f]/30 px-2 py-0.5 text-[9px] uppercase tracking-[0.12em] text-[#a7c9c0]">Active</span>}<span className="mt-1 block text-xs text-[#777169]">{series.recurrence} · {series.spaceName}</span></span></label>)}</div>}

          <div className="mt-6 flex flex-wrap gap-2">{google.connected ? <><button onClick={() => void subscribeGoogle()} disabled={!googleSeriesId || googleBusy !== null} className="primary-button">{googleBusy === 'subscribe' ? <LoaderCircle size={14} className="animate-spin" /> : <Radio size={14} />}{google.subscription ? 'Update subscription' : 'Subscribe to transcripts'}</button><button onClick={() => void disconnectGoogle()} disabled={googleBusy !== null} className="secondary-button">Disconnect Google</button></> : <button onClick={() => void connectGoogle()} disabled={googleBusy !== null} className="primary-button">{googleBusy === 'connect' ? <LoaderCircle size={14} className="animate-spin" /> : <Video size={14} />}Connect Google</button>}</div>

          {google.subscription && google.selectedSeries && <div className="mt-5 rounded-xl border border-[#52796f]/25 bg-[#52796f]/[0.07] p-4"><div className="flex items-center gap-2 text-xs text-[#a7c9c0]"><Check size={13} />Listening for transcript-generated events</div><p className="mt-2 text-sm text-[#d1c9be]">{google.selectedSeries.title}</p><p className="mt-1 break-all text-[11px] text-[#6f6962]">{google.subscription.targetResource}</p>{google.mode === 'mock' && <button onClick={() => void simulateGoogleTranscript()} disabled={googleBusy !== null} className="secondary-button mt-4"><Sparkles size={14} />{googleBusy === 'simulate' ? 'Processing transcript' : 'Simulate transcript ready'}</button>}</div>}
        </article>
      </section>

      {googleResult && <section className="panel p-6 sm:p-7"><div className="flex items-center gap-2 text-sm text-[#a7c9c0]"><Check size={15} />{googleResult.duplicate ? 'This transcript event was already processed.' : `${generatedContributions.length} contributions were added automatically with no review gate.`}</div>{!!generatedContributions.length && <div className="mt-4 grid gap-3 md:grid-cols-2">{generatedContributions.map((item) => <Link key={item.id} href={`/employee/contributions#${item.id}`} className="group rounded-xl border border-white/[0.08] bg-black/10 p-4 transition hover:border-[#a98cf5]/30"><div className="flex items-center justify-between gap-3"><span className="text-[11px] text-[#716a63]">{projectById(item.projectId)?.name}</span><ArrowRight size={13} className="text-white/25 group-hover:text-[#b8a1f4]" /></div><p className="mt-2 text-sm text-[#d1c8bd]">{item.title}</p></Link>)}</div>}</section>}

      {result && <section className="rounded-2xl border border-[#52796f]/30 bg-[#52796f]/10 p-5 text-sm text-[#a7c9c0]"><div className="flex items-center gap-2"><Check size={15} />Sync completed.</div><p className="mt-2 text-xs text-[#849f98]">Queued {result.queued}; processed {result.processed}; ignored {result.ignored}; failed {result.failed}. New evidence-backed drafts appear privately in Review Brief.</p></section>}

      <section className="panel p-6 sm:p-7">
        <p className="eyebrow">Privacy controls</p>
        <h2 className="mt-2 font-serif text-2xl text-[#eee7dc]">Your imported evidence stays under your control</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#817a72]">Disconnecting stops future Outlook syncs. Deleting imported evidence removes Outlook-derived source records and contribution drafts for your employee account; it does not delete messages in Outlook.</p>
        <button onClick={() => void deleteEvidence()} disabled={busy !== null} className="danger-button mt-5"><Trash2 size={14} />{busy === 'delete' ? 'Deleting evidence' : 'Delete imported Outlook evidence'}</button>
      </section>
    </div>
  )
}
