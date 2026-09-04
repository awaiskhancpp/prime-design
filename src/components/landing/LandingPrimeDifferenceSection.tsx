'use client'

import { useRef, useState } from 'react'
import { Check, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

const statLine = 'Over 350+ Projects in Silicon Valley'

const bullets = [
  { lead: '', text: 'Experts on-site for interior design' },
  { lead: '', text: 'Certified general contractor, fully licensed' },
  { lead: 'Family-owned', text: ' and operated business' },
  { lead: 'Competitive', text: ' pricing for our services' },
  { lead: 'Quick response', text: ' for customer satisfaction' },
]

const projectVideos = [
  {
    title: 'Noah, Co-Owner',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Vid%20Noah.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'Rosewood Dr, Atherton',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/03.09.2024%20Noam%20Prime%2041%20Rosewood%20Dr%20Atherton.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'Alice Ave, Mountain View',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4',
    poster: '/services/kitchen-remodeling.jpeg',
  },
  {
    title: 'Bluebonnet Ct, Morgan Hill',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'First floor renovation',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/First%20Floor.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
]

type LandingPrimeDifferenceVideo = {
  url: string
  poster?: string
  caption?: string
}

type LandingPrimeDifferenceSectionProps = {
  eyebrow?: string
  heading?: string
  body?: string
  checklist?: string[]
  videos?: LandingPrimeDifferenceVideo[]
}

export function LandingPrimeDifferenceSection({
  eyebrow,
  heading,
  body,
  checklist,
  videos,
}: LandingPrimeDifferenceSectionProps) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const activeChecklist = checklist ?? bullets.map((bullet) => `${bullet.lead}${bullet.text}`)
  const activeVideos = videos ?? projectVideos.map((video) => ({
    url: video.url,
    poster: video.poster,
    caption: video.title,
  }))
  const active = activeVideos[index]

  function goTo(nextIndex: number) {
    setIndex(nextIndex)
    setPlaying(false)
  }

  function togglePlay() {
    const el = videoRef.current
    if (!el) return
    if (el.paused) {
      el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <Section className="bg-ink-2 text-white">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrow ?? statLine}
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">
            {heading ?? 'The Prime Difference'}
          </h2>

          {body && <p className="mt-5 leading-relaxed text-white/75">{body}</p>}

          <ul className="mt-8 space-y-4">
            {activeChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] text-ink"
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className="italic leading-relaxed text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {active && (
          <div>
            {/* Single custom control surface — no native <video controls>. */}
            <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-black">
              <video
                key={active.url}
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                preload="metadata"
                poster={active.poster}
                onEnded={() => setPlaying(false)}
              >
                <source src={active.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? 'Pause video' : 'Play video'}
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/10"
              >
                {!playing && (
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-ink shadow-lg">
                    <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden />
                  </span>
                )}
              </button>

              {playing && (
                <button
                  type="button"
                  onClick={togglePlay}
                  aria-label="Pause video"
                  className="absolute bottom-4 left-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                >
                  <Pause className="h-4 w-4 fill-current" aria-hidden />
                </button>
              )}

            {activeVideos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goTo((index - 1 + activeVideos.length) % activeVideos.length)}
                  aria-label="Previous video"
                  className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-brass/70 bg-ink/60 text-brass transition-colors hover:bg-ink hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => goTo((index + 1) % activeVideos.length)}
                  aria-label="Next video"
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-brass/70 bg-ink/60 text-brass transition-colors hover:bg-ink hover:text-white"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </button>
              </>
            )}
          </div>

            {activeVideos.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {activeVideos.map((video, i) => (
                  <button
                    key={video.url}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={video.caption ? `Show video: ${video.caption}` : 'Select video'}
                    aria-current={i === index}
                    className={cn(
                      'border px-3 py-1.5 text-xs transition-colors',
                      i === index
                        ? 'border-brass bg-brass text-ink'
                        : 'border-white/25 text-white/70 hover:border-brass hover:text-brass',
                    )}
                  >
                    {video.caption || `Video ${i + 1}`}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Section>
  )
}
