import { useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ArrowRight, Equal, BarChart2, Instagram, Twitter, Linkedin, Heart, TrendingUp, Eye, Users } from 'lucide-react'
import VaporizeTextCycle, { Tag } from '@/components/ui/vapour-text-effect'
import Dashboard from './pages/Dashboard'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

// ─── Landing page ────────────────────────────────────────────
function Landing() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const fadingOutRef = useRef(false)
  const rafRef = useRef<number | null>(null)
  const opacityRef = useRef(0)

  const cancelFade = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const fadeTo = (target: number, duration: number) => {
    cancelFade()
    const video = videoRef.current
    if (!video) return
    const startOpacity = opacityRef.current
    const startTime = performance.now()
    const tick = (now: number) => {
      const elapsed = now - startTime
      const t = Math.min(elapsed / duration, 1)
      const next = startOpacity + (target - startOpacity) * t
      opacityRef.current = next
      video.style.opacity = String(next)
      if (t < 1) { rafRef.current = requestAnimationFrame(tick) }
      else { rafRef.current = null }
    }
    rafRef.current = requestAnimationFrame(tick)
  }

  const fadeIn = () => fadeTo(1, 500)
  const fadeOut = () => fadeTo(0, 500)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    video.style.opacity = '0'
    opacityRef.current = 0

    const handleLoadedData = () => { fadingOutRef.current = false; fadeIn() }
    const handleTimeUpdate = () => {
      if (!video.duration || fadingOutRef.current) return
      if (video.duration - video.currentTime <= 0.55) { fadingOutRef.current = true; fadeOut() }
    }
    const handleEnded = () => {
      opacityRef.current = 0
      video.style.opacity = '0'
      cancelFade()
      window.setTimeout(() => {
        video.currentTime = 0
        const p = video.play()
        if (p) p.catch(() => {})
        fadingOutRef.current = false
        fadeIn()
      }, 100)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    if (video.readyState >= 2) handleLoadedData()

    return () => {
      cancelFade()
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  return (
    <div className="bg-black overflow-x-hidden">

      {/* ═══ HERO — self-contained full-screen, video inside only ═══ */}
      <div className="relative h-screen overflow-hidden flex flex-col">

        {/* Video background */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
          src={VIDEO_SRC}
          muted
          autoPlay
          playsInline
          preload="auto"
        />
        {/* Dark overlay so text is legible */}
        <div className="absolute inset-0 bg-black/30" />
        {/* Fade video into black at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-black" />

        {/* ─── NAV ─── */}
        <nav className="relative z-20 pl-6 pr-6 py-6 shrink-0">
          <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-white">
                <Equal size={22} strokeWidth={2.5} />
                <span className="font-semibold text-lg tracking-wide">Seen</span>
              </div>
              <div className="hidden md:flex items-center gap-8">
                <a href="#impact" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Impact</a>
                <a href="#mission" className="text-white/80 hover:text-white transition-colors text-sm font-medium">Our Mission</a>
                <a href="#companies" className="text-white/80 hover:text-white transition-colors text-sm font-medium">For Companies</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button type="button" className="text-white text-sm font-medium">Sign In</button>
              <button type="button" className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/10 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* ─── HERO CONTENT ─── */}
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-16 text-center">
          <div className="liquid-glass rounded-full px-4 py-1.5 mb-6 inline-flex items-center gap-2">
            <span className="text-white/70 text-xs font-medium tracking-widest uppercase">
              Equal opportunity. No exceptions.
            </span>
          </div>

          <h1
            className="text-5xl md:text-6xl lg:text-7xl text-white mb-5 tracking-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Women deserve<br />to be seen.
          </h1>

          <p className="text-white/70 text-base md:text-lg leading-relaxed max-w-lg mb-10">
            Seen uses data analytics to expose promotion gaps, surface hidden talent, and hold workplaces accountable — so every woman gets the recognition she has earned.
          </p>

          <div className="flex items-center gap-4 flex-wrap justify-center">
            <button type="button" className="bg-white rounded-full px-8 py-3 text-black text-sm font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors">
              Get Started <ArrowRight size={16} />
            </button>
            <button type="button" className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors">
              <BarChart2 size={16} /> See the Data
            </button>
          </div>
        </main>

      </div>{/* end hero */}

      {/* ─── STATS BAND ─── */}
      <section id="impact" className="bg-black py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { icon: <TrendingUp size={28} className="text-white/60" />, stat: '2×', label: 'Less likely to be promoted' },
            { icon: <Users size={28} className="text-white/60" />, stat: '40%', label: 'Of women feel invisible at work' },
            { icon: <Eye size={28} className="text-white/60" />, stat: '73%', label: 'Of contributions go uncredited' },
            { icon: <Heart size={28} className="text-white/60" />, stat: '1 in 3', label: 'Women consider leaving due to bias' },
          ].map(({ icon, stat, label }) => (
            <div key={label} className="flex flex-col items-center gap-3">
              {icon}
              <span className="text-4xl text-white" style={{ fontFamily: "'Instrument Serif', serif" }}>{stat}</span>
              <span className="text-white/50 text-sm leading-snug">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── MISSION / STORY ─── */}
      <section id="mission" className="bg-black py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-6 text-center">Our Mission</p>

          <h2
            className="text-4xl md:text-5xl text-white text-center mb-16 leading-tight"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            A story we can't afford<br />to keep ignoring.
          </h2>

          <div className="space-y-8 text-white/70 text-base md:text-lg leading-relaxed">
            <p>
              Maya had worked at the same company for six years. She had shipped the product that tripled their revenue. She had mentored four junior engineers who were now team leads. And every performance review, she was told she was "almost ready" for a promotion.
            </p>
            <p>
              The man hired after her — with half the tenure — became her manager.
            </p>
            <p>
              Maya's story is not rare. According to McKinsey's <em>Women in the Workplace</em> report, women are promoted at significantly lower rates than men at every stage of the corporate ladder. Not because of merit. Not because of ambition. But because the systems that evaluate performance were never designed with them in mind.
            </p>
            <blockquote
              className="border-l-2 border-white/20 pl-6 italic text-white/60 text-xl"
              style={{ fontFamily: "'Instrument Serif', serif" }}
            >
              "The data doesn't lie — it just gets ignored. We built Seen so that it can't be."
            </blockquote>
            <p>
              Seen was built for every Maya. It tracks contribution patterns, flags structural promotion gaps, and gives companies the analytics they need to course-correct — before more talent walks out the door. Because the problem isn't a pipeline issue. The problem is that women have been doing the work, and the work has gone unseen.
            </p>
            <p>
              We believe equal employment isn't a favor. It's a baseline. And data is how we get there.
            </p>
          </div>

          <div className="mt-16 flex justify-center">
            <button type="button" className="bg-white rounded-full px-10 py-4 text-black text-sm font-semibold flex items-center gap-2 hover:bg-white/90 transition-colors">
              Join the Movement <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOR COMPANIES ─── */}
      <section id="companies" className="bg-black py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/30 text-xs tracking-widest uppercase mb-6 text-center">For Companies</p>
          <h2
            className="text-4xl md:text-5xl text-white text-center mb-16"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Accountability, built in.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Promotion Gap Analytics', body: 'See exactly where your pipeline breaks. Track promotion rates by gender across every team and level, in real time.' },
              { title: 'Contribution Visibility', body: 'Surface who is doing the work. Seen maps output and impact to individuals — not just the loudest voice in the room.' },
              { title: 'Bias Alerts', body: 'Get flagged before patterns become policy. Our models detect structural bias early so you can fix it before it costs you.' },
            ].map(({ title, body }) => (
              <div key={title} className="liquid-glass rounded-2xl p-8">
                <h3 className="text-white font-semibold text-lg mb-3">{title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-black border-t border-white/5 pt-16 pb-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col items-center gap-12">

          {/* Vapour text wordmark */}
          <div className="w-full" style={{ height: '100px' }}>
            <VaporizeTextCycle
              texts={["Seen.", "Equal rights.", "Be seen.", "Get promoted.", "Seen."]}
              font={{ fontFamily: "'Instrument Serif', serif", fontSize: "72px", fontWeight: 400 }}
              color="rgb(255, 255, 255)"
              spread={4}
              density={7}
              animation={{ vaporizeDuration: 2.5, fadeInDuration: 1, waitDuration: 1.5 }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.H2}
            />
          </div>

          <p className="text-white/40 text-sm text-center max-w-md">
            Seen is on a mission to close the promotion gap for women through radical transparency and data-driven accountability.
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-white/40 text-sm">
            <a href="#impact" className="hover:text-white transition-colors">Impact</a>
            <a href="#mission" className="hover:text-white transition-colors">Our Mission</a>
            <a href="#companies" className="hover:text-white transition-colors">For Companies</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full gap-6 border-t border-white/5 pt-8">
            <span className="text-white/20 text-xs">© 2026 Seen. All rights reserved.</span>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" aria-label="Instagram" className="liquid-glass rounded-full p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Instagram size={18} />
              </a>
              <a href="https://twitter.com" aria-label="Twitter" className="liquid-glass rounded-full p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" className="liquid-glass rounded-full p-3 text-white/60 hover:text-white hover:bg-white/5 transition-all">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

// ─── Router root ─────────────────────────────────────────────
function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  )
}

export default App
