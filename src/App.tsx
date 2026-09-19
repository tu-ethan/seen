import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { ArrowDown, ArrowRight, Equal, ExternalLink } from 'lucide-react'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'
import Dashboard from './pages/Dashboard'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

const sources = [
  ['82.1¢ earnings ratio', 'U.S. Bureau of Labor Statistics', 'https://www.bls.gov/news.release/archives/wkyeng_01282026.htm'],
  ['5.5% starting-offer gap', 'Organization Science', 'https://pubsonline.informs.org/doi/abs/10.1287/orsc.2023.17883'],
  ['Sponsorship and burnout', 'Women in the Workplace 2025', 'https://leanin.org/report/women-in-the-workplace/'],
  ['Working-parent stress', 'Pew Research Center', 'https://www.pewresearch.org/social-trends/2026/06/16/for-working-parents-the-boundary-between-work-and-family-is-often-blurred/'],
]

function money(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)
}

function StorySection({
  id,
  title,
  className = '',
  children,
}: {
  id?: string
  title: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className={`story-section ${className}`}>
      <div className="story-sticky">
        <div className="morph-title" aria-hidden="true">{title}</div>
        <div className="story-content">
          {children}
        </div>
      </div>
    </section>
  )
}

function Landing() {
  const [salary, setSalary] = useState(100_000)
  const videoRef = useRef<HTMLVideoElement>(null)
  const comparison = useMemo(() => Math.round(salary * 0.821), [salary])

  useEffect(() => {
    let frame = 0
    const updateSections = () => {
      frame = 0
      document.querySelectorAll<HTMLElement>('.story-section').forEach((section) => {
        const rect = section.getBoundingClientRect()
        const travel = Math.max(section.offsetHeight - window.innerHeight, 1)
        const progress = Math.min(Math.max(-rect.top / travel, 0), 1)
        const morph = Math.min(progress / 0.34, 1)
        const content = Math.min(Math.max((progress - 0.2) / 0.23, 0), 1)
        section.style.setProperty('--morph-progress', String(morph))
        section.style.setProperty('--content-progress', String(content))
      })
    }
    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateSections)
    }
    updateSections()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const fadeNearEnd = () => {
      if (video.duration) video.classList.toggle('video-fading', video.duration - video.currentTime < 0.65)
    }
    const restart = () => {
      video.currentTime = 0
      video.classList.remove('video-fading')
      void video.play().catch(() => undefined)
    }
    video.addEventListener('timeupdate', fadeNearEnd)
    video.addEventListener('ended', restart)
    return () => {
      video.removeEventListener('timeupdate', fadeNearEnd)
      video.removeEventListener('ended', restart)
    }
  }, [])

  return (
    <div className="landing-page bg-black text-white">
      <header id="top" className="hero-cinematic">
        <video ref={videoRef} className="hero-video" src={VIDEO_SRC} muted autoPlay playsInline preload="metadata" />
        <div className="hero-shade" aria-hidden="true" />
        <nav className="relative z-20 px-5 py-5 md:px-8 md:py-7" aria-label="Primary navigation">
          <div className="liquid-glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3">
            <a href="#top" className="flex items-center gap-2 text-white" aria-label="Seen home"><Equal size={21} strokeWidth={2.5} /><span className="font-semibold tracking-wide">Seen</span></a>
            <div className="hidden items-center gap-7 text-sm text-white/65 md:flex"><a href="#problem" className="hover:text-white">The problem</a><a href="#belief" className="hover:text-white">Our belief</a><a href="#impact" className="hover:text-white">The impact</a></div>
            <Link to="/proof" className="glass-button">See Seen</Link>
          </div>
        </nav>
        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-92px)] max-w-6xl flex-col justify-center px-5 pb-16 md:px-8">
          <p className="hero-kicker">Work should speak for itself.</p>
          <h1 className="hero-title">Women deserve<br />to be seen.</h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/70 md:text-lg">Seen turns everyday work into evidence—before reviews begin.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link to="/proof" className="primary-button">See Seen in action <ArrowRight size={17} /></Link><a href="#problem" className="secondary-button">Why it matters <ArrowDown size={16} /></a></div>
        </div>
      </header>

      <div className="marquee" aria-hidden="true"><div className="marquee-track"><span>WORK</span><i>→</i><span>EVIDENCE</span><i>→</i><span>RECOGNITION</span><i>→</i><span>OPPORTUNITY</span><i>→</i><span>WORK</span><i>→</i><span>EVIDENCE</span><i>→</i><span>RECOGNITION</span><i>→</i><span>OPPORTUNITY</span><i>→</i></div></div>

      <StorySection id="problem" title="THE PROBLEM" className="problem-story">
        <div className="problem-layout">
          <div className="salary-tool">
            <div className="salary-topline">
              <div><span>MEN’S PAY BENCHMARK</span><strong>{money(salary)}</strong></div>
              <div className="salary-gap"><span>THE GAP</span><strong>−{money(salary - comparison)}</strong></div>
            </div>
            <label className="salary-control">
              <span>Drag the benchmark</span>
              <input
                type="range"
                min="40000"
                max="250000"
                step="1000"
                value={salary}
                onChange={(event) => setSalary(Number(event.target.value))}
                style={{ '--salary-progress': `${((salary - 40000) / 210000) * 100}%` } as React.CSSProperties}
              />
            </label>
            <div className="pay-comparison">
              <div className="pay-card benchmark-card"><span>MEN</span><strong>{money(salary)}</strong><i>Benchmark</i></div>
              <div className="pay-card ratio-card"><span>WOMEN</span><strong>{money(comparison)}</strong><i>At the 82.1¢ ratio</i></div>
            </div>
            <a className="micro-source" href={sources[0][2]} target="_blank" rel="noreferrer">Overall median weekly earnings ratio, full-time U.S. workers, 2025 <ExternalLink size={12} /></a>
          </div>
          <aside className="problem-why">
            <span>WHY?</span>
            <h2>Women are less supported.</h2>
            <div className="support-compact">
              <div><small>WOMEN</small><strong>31%</strong></div>
              <i>VS</i>
              <div><small>MEN</small><strong>45%</strong></div>
            </div>
            <p>of entry-level employees have a sponsor.</p>
            <a className="micro-source" href={sources[2][2]} target="_blank" rel="noreferrer">Women in the Workplace 2025 <ExternalLink size={12} /></a>
          </aside>
          <div className="offer-strip">
            <span>EVEN AFTER CONTROLLING FOR ROLE + EXPERIENCE</span>
            <strong>5.5% LOWER STARTING OFFERS</strong>
            <a href={sources[1][2]} target="_blank" rel="noreferrer">700,000+ offers <ExternalLink size={12} /></a>
          </div>
        </div>
      </StorySection>

      <StorySection title="THE EFFECT" className="effect-story">
        <div className="mental-health-title">Mental health is part of the cost.</div>
        <div className="effect-stack">
          <div className="effect-line"><span>LESS PAY<small>overall earnings ratio</small></span><b>−17.9%</b></div>
          <div className="effect-line"><span>MORE STRESS<small>working mothers say balance is difficult</small></span><b>62%</b></div>
          <div className="effect-line effect-emphasis"><span>MORE BURNOUT<small>senior women frequently feel burned out</small></span><b>60%</b></div>
        </div>
        <div className="effect-sources"><a href={sources[0][2]} target="_blank" rel="noreferrer">Pay <ExternalLink size={11} /></a><a href={sources[3][2]} target="_blank" rel="noreferrer">Stress <ExternalLink size={11} /></a><a href={sources[2][2]} target="_blank" rel="noreferrer">Burnout <ExternalLink size={11} /></a></div>
      </StorySection>

      <StorySection id="belief" title="WHAT WE BELIEVE" className="belief-story">
        <div className="belief-title">Focus on your work<br />knowing it will be seen.</div>
        <div className="belief-grid">
          <div><b>1</b><span>Proof ready when it matters.</span></div>
          <div><b>2</b><span>Objective documentation of what you did.</span></div>
          <div><b>3</b><span>No hassle or worry about your work being forgotten.</span></div>
        </div>
      </StorySection>

      <StorySection id="impact" title="THE IMPACT" className="impact-story">
        <div className="impact-grid" aria-label="The impact of work being seen">
          <div><b>1</b><span>MORE<br />FOCUS</span></div>
          <div><b>2</b><span>MORE<br />CONFIDENCE</span></div>
          <div><b>3</b><span>STRONGER<br />LEADERS</span></div>
          <div><b>4</b><span>BETTER<br />CULTURE</span></div>
        </div>
        <Link to="/proof" className="primary-button impact-cta">See the demo <ArrowRight size={17} /></Link>
      </StorySection>

      <section className="vapour-section">
        <div className="vapour-stage"><VaporizeTextCycle texts={['Do the work.', 'Keep the proof.', 'Be seen.', 'Seen.']} font={{ fontFamily: "'Instrument Serif', serif", fontSize: '88px', fontWeight: 400 }} color="rgb(255,255,255)" spread={4} density={7} animation={{ vaporizeDuration: 2.2, fadeInDuration: 0.8, waitDuration: 1.3 }} direction="left-to-right" alignment="center" tag={Tag.H2} /></div>
        <Link to="/proof" className="primary-button mt-8">See Seen in action <ArrowRight size={17} /></Link>
      </section>

      <footer className="border-t border-white/10 bg-black px-5 py-8 md:px-8"><div className="mx-auto flex max-w-6xl flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><a href="#top" className="flex items-center gap-2 font-semibold"><Equal size={18} /> Seen</a><div className="flex flex-wrap gap-5 text-xs text-white/45">{sources.map(([label, , href]) => <a key={label} href={href} target="_blank" rel="noreferrer" className="hover:text-white">{label}</a>)}</div><span className="text-xs text-white/30">© 2026</span></div></footer>
    </div>
  )
}

function App() {
  return <Routes><Route path="/" element={<Landing />} /><Route path="/proof" element={<Dashboard />} /><Route path="/dashboard" element={<Dashboard />} /></Routes>
}

export default App
