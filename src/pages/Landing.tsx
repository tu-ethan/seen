import { useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Globe, Instagram, Twitter } from 'lucide-react'

const VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4'

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

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick)
      } else {
        rafRef.current = null
      }
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

    const handleLoadedData = () => {
      fadingOutRef.current = false
      fadeIn()
    }

    const handleTimeUpdate = () => {
      if (!video.duration || fadingOutRef.current) return
      if (video.duration - video.currentTime <= 0.55) {
        fadingOutRef.current = true
        fadeOut()
      }
    }

    const handleEnded = () => {
      opacityRef.current = 0
      video.style.opacity = '0'
      cancelFade()

      window.setTimeout(() => {
        video.currentTime = 0
        const playPromise = video.play()
        if (playPromise) playPromise.catch(() => {})
        fadingOutRef.current = false
        fadeIn()
      }, 100)
    }

    video.addEventListener('loadeddata', handleLoadedData)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)

    if (video.readyState >= 2) {
      handleLoadedData()
    }

    return () => {
      cancelFade()
      video.removeEventListener('loadeddata', handleLoadedData)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden flex flex-col relative">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover translate-y-[17%]"
        src={VIDEO_SRC}
        muted
        autoPlay
        playsInline
        preload="auto"
      />

      <nav className="relative z-20 pl-6 pr-6 py-6">
        <div className="liquid-glass rounded-full px-6 py-3 flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-white">
              <Globe size={24} />
              <span className="font-semibold text-lg">Seen</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                How it works
              </a>
              <a href="#why" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                Why Seen
              </a>
              <a href="#about" className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                About
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="liquid-glass rounded-full px-6 py-2 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-12 text-center -translate-y-[20%]">
        <h1
          className="text-5xl md:text-6xl lg:text-7xl text-white mb-8 tracking-tight"
          style={{ fontFamily: "'Instrument Serif', serif" }}
        >
          Your work, finally on the record
        </h1>

        <div className="max-w-xl w-full space-y-4">
          <form onSubmit={handleSubmit} className="liquid-glass rounded-full pl-6 pr-2 py-2 flex items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none border-none text-white placeholder:text-white/40 text-base min-w-0"
            />
            <button type="submit" className="bg-white rounded-full p-3 text-black shrink-0" aria-label="Subscribe">
              <ArrowRight size={20} />
            </button>
          </form>

          <p className="text-white text-sm leading-relaxed px-4">
            Seen quietly captures the wins you'd otherwise have to fight to remember, so when it's time for a
            promotion, you walk in with proof, not just a pitch. Join the waitlist to get early access.
          </p>

          <div className="flex justify-center">
            <button
              type="button"
              className="liquid-glass rounded-full px-8 py-3 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Our Story
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 flex justify-center gap-4 pb-12">
        <a
          href="https://instagram.com"
          aria-label="Instagram"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Instagram size={20} />
        </a>
        <a
          href="https://twitter.com"
          aria-label="Twitter"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Twitter size={20} />
        </a>
        <a
          href="https://asme.com"
          aria-label="Website"
          className="liquid-glass rounded-full p-4 text-white/80 hover:text-white hover:bg-white/5 transition-all"
        >
          <Globe size={20} />
        </a>
      </footer>
    </div>
  )
}

export default Landing
