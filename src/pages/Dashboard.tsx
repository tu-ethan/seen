import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileAudio,
  Globe,
  LoaderCircle,
  Sparkles,
  Upload,
} from 'lucide-react'

type Highlight = {
  text: string
  evidence: string
}

type MeetingRecord = {
  id: number
  meetingDate: string
  title: string
  summary: string
  highlights: Highlight[]
  skills: string[]
  sourceFilename: string
  createdAt: string
}

type Milestone = {
  label: string
  date: string
  reached: boolean
}

const MILESTONES: Milestone[] = [
  { label: 'Joined team', date: 'Jan 2026', reached: true },
  { label: 'First project shipped', date: 'Mar 2026', reached: true },
  { label: 'Led cross-team initiative', date: 'Jun 2026', reached: true },
  { label: 'Mentored junior engineers', date: 'Aug 2026', reached: true },
  { label: 'Promotion review', date: 'Oct 2026', reached: false },
]

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`))
}

function Dashboard() {
  const [meetings, setMeetings] = useState<MeetingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fileName, setFileName] = useState('')

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  useEffect(() => {
    async function loadMeetings() {
      try {
        const response = await fetch('/api/meetings')
        if (!response.ok) throw new Error('Could not load your meeting records.')
        setMeetings(await response.json())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load your meeting records.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadMeetings()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsProcessing(true)

    const form = event.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('/api/meetings', {
        method: 'POST',
        body: formData,
      })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error || 'The meeting could not be processed.')

      setMeetings((current) => [payload, ...current])
      setSuccess('Meeting processed and added to your impact record.')
      setFileName('')
      form.reset()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'The meeting could not be processed.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex flex-col relative">
      <nav className="relative z-20 px-4 md:px-6 py-6">
        <div className="liquid-glass rounded-full px-5 md:px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-white">
            <Globe size={24} />
            <span className="font-semibold text-lg">Seen</span>
          </div>
          <Link
            to="/"
            aria-label="Back home"
            className="liquid-glass rounded-full px-4 md:px-6 py-2 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/5 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back home</span>
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex-1 px-4 md:px-6 pb-16">
        <div className="max-w-5xl mx-auto">
          <div className="mb-10">
            <p className="text-white/60 text-base mb-2">{today}</p>
            <h1
              className="text-4xl md:text-5xl text-white tracking-tight"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              Your work, made visible
            </h1>
          </div>

          <section className="liquid-glass rounded-2xl p-6 md:p-8 mb-10">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-7">
              <div>
                <div className="flex items-center gap-2 text-white mb-2">
                  <Sparkles size={18} />
                  <h2 className="text-xl font-semibold">Process a weekly meeting</h2>
                </div>
                <p className="text-white/55 text-sm leading-relaxed max-w-2xl">
                  Upload the meeting recording. ElevenLabs creates a speaker-aware transcript, then Gemini turns it into grounded highlights and demonstrated skills.
                </p>
              </div>
              <span className="text-white/40 text-xs uppercase tracking-widest whitespace-nowrap">Seen does not store audio</span>
            </div>

            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-5">
              <label className="block md:col-span-2">
                <span className="block text-white/70 text-sm font-medium mb-2">Meeting recording</span>
                <span className="min-h-28 border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 px-5 py-6 text-center hover:border-white/40 transition-colors cursor-pointer">
                  <FileAudio size={24} className="text-white/65" />
                  <span className="text-white text-sm font-medium">{fileName || 'Choose an audio or video file'}</span>
                  <span className="text-white/40 text-xs">MP3, WAV, M4A, MP4, MOV, or another common format · max 250 MB</span>
                  <input
                    required
                    type="file"
                    name="file"
                    accept="audio/*,video/*"
                    className="sr-only"
                    onChange={(event) => setFileName(event.target.files?.[0]?.name || '')}
                  />
                </span>
              </label>

              <label className="block">
                <span className="block text-white/70 text-sm font-medium mb-2">Meeting date</span>
                <span className="relative block">
                  <CalendarDays size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                  <input
                    required
                    type="date"
                    name="meetingDate"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="seen-input pl-11"
                  />
                </span>
              </label>

              <label className="block">
                <span className="block text-white/70 text-sm font-medium mb-2">Person whose work should be captured</span>
                <input
                  type="text"
                  name="focusPerson"
                  placeholder="Optional — e.g. Maya Chen"
                  className="seen-input"
                />
              </label>

              <label className="block">
                <span className="block text-white/70 text-sm font-medium mb-2">Number of speakers</span>
                <input
                  type="number"
                  name="speakerCount"
                  min="1"
                  max="32"
                  placeholder="Optional — improves separation"
                  className="seen-input"
                />
              </label>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-white rounded-xl px-6 py-3 text-black text-sm font-semibold flex items-center justify-center gap-2 hover:bg-white/90 disabled:opacity-60 disabled:cursor-wait transition-colors"
                >
                  {isProcessing ? <LoaderCircle size={17} className="animate-spin" /> : <Upload size={17} />}
                  {isProcessing ? 'Transcribing and summarizing…' : 'Create impact record'}
                </button>
              </div>

              {error && (
                <p role="alert" className="md:col-span-2 text-red-300 bg-red-400/10 border border-red-300/15 rounded-xl px-4 py-3 text-sm">
                  {error}
                </p>
              )}
              {success && (
                <p className="md:col-span-2 text-emerald-200 bg-emerald-400/10 border border-emerald-300/15 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  {success}
                </p>
              )}
            </form>
          </section>

          <section className="mb-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white/80 text-base font-semibold uppercase tracking-wide">Impact timeline</h2>
              {!isLoading && <span className="text-white/40 text-sm">{meetings.length} meeting{meetings.length === 1 ? '' : 's'}</span>}
            </div>

            <div className="liquid-glass rounded-2xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[10rem_1fr_15rem] text-white/60 text-sm font-semibold uppercase tracking-wide border-b border-white/10">
                <div className="px-6 py-4 border-r border-white/10">Date</div>
                <div className="px-6 py-4 border-r border-white/10">What changed</div>
                <div className="px-6 py-4">Skills shown</div>
              </div>

              {isLoading && (
                <div className="px-6 py-12 text-white/50 text-sm flex items-center justify-center gap-2">
                  <LoaderCircle size={16} className="animate-spin" />
                  Loading your record…
                </div>
              )}

              {!isLoading && meetings.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <p className="text-white text-lg font-semibold mb-2">Your first meeting record will appear here.</p>
                  <p className="text-white/50 text-sm">Upload a weekly meeting above to capture the work that should not be forgotten.</p>
                </div>
              )}

              {meetings.map((meeting, index) => (
                <article
                  key={meeting.id}
                  className={`grid md:grid-cols-[10rem_1fr_15rem] ${index !== meetings.length - 1 ? 'border-b border-white/10' : ''}`}
                >
                  <div className="px-6 pt-6 md:py-6 md:border-r border-white/10 text-white/70 text-base">
                    <span className="md:hidden text-white/35 text-xs uppercase tracking-wider mr-2">Date</span>
                    {formatDate(meeting.meetingDate)}
                  </div>
                  <div className="px-6 py-5 md:py-6 md:border-r border-white/10 min-w-0">
                    <p className="text-white text-lg font-semibold mb-2">{meeting.title}</p>
                    <p className="text-white/55 text-sm leading-relaxed mb-4">{meeting.summary}</p>
                    <ul className="space-y-3">
                      {meeting.highlights.map((highlight) => (
                        <li key={`${meeting.id}-${highlight.text}`} className="text-white/80 text-base leading-relaxed flex gap-2">
                          <span className="text-white/40 shrink-0">—</span>
                          <span>
                            {highlight.text}
                            <span className="block text-white/40 text-xs leading-relaxed mt-1">Evidence: {highlight.evidence}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="px-6 pb-6 md:py-6 flex flex-wrap md:flex-col gap-2.5 items-start min-w-0">
                    {meeting.skills.map((skill) => (
                      <span
                        key={`${meeting.id}-${skill}`}
                        className="liquid-glass rounded-full px-4 py-1.5 text-white/85 text-sm font-medium max-w-full truncate"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-white/80 text-base font-semibold uppercase tracking-wide mb-6">Progress</h2>
            <div className="liquid-glass rounded-2xl px-5 md:px-8 py-10 overflow-x-auto">
              <div className="relative flex items-start justify-between min-w-[680px]">
                <div className="absolute top-[7px] left-0 right-0 h-px bg-white/15" />
                {MILESTONES.map((milestone) => (
                  <div key={milestone.label} className="relative flex flex-col items-center text-center flex-1 px-2">
                    <div
                      className={`w-3.5 h-3.5 rounded-full mb-4 ${
                        milestone.reached ? 'bg-white' : 'bg-white/20 border border-white/40'
                      }`}
                    />
                    <p className={`text-base font-semibold mb-1 ${milestone.reached ? 'text-white' : 'text-white/50'}`}>
                      {milestone.label}
                    </p>
                    <p className="text-white/50 text-sm">{milestone.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
