'use client'

import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import { useRef, useState } from 'react'

import { Section } from '@/components/ui/Section'

type LandingVideo = { url: string; poster?: string; caption?: string }

export function LandingPrimeDifferenceSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  checklist,
  videos = [],
}: {
  eyebrow?: string
  heading?: string
  headingAccent?: string
  body?: string
  checklist?: string[]
  videos?: LandingVideo[]
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const current = videos[index]

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
      <div className="max-w-4xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
        ) : null}
        <h2 className="mt-4 font-display text-3xl font-medium md:text-5xl">
          {heading || headingAccent ? (
            <>
              {heading}
              {heading && headingAccent ? ' ' : null}
              {headingAccent ? (
                <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
                  {headingAccent}
                </span>
              ) : null}
            </>
          ) : null}
        </h2>
        {body ? <p className="mt-5 max-w-3xl text-base leading-7 text-white/75">{body}</p> : null}
        {checklist?.length ? (
          <ul className="mt-6 grid max-w-2xl gap-3 text-sm text-white/80">
            {checklist.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        ) : null}
        <div className="mt-8 h-px w-full bg-white/25" aria-hidden />
      </div>

      {current ? (
        <div className="mt-8">
            {/* Single, custom-driven control surface — no native <video
                controls>. Mixing the browser's own scrubber/volume/
                fullscreen bar with custom prev/next arrows and dots is
                what made the source page's carousel look broken; here
                there is exactly one control system. */}
            <div className="relative aspect-video w-full overflow-hidden border border-white/10 bg-black">
              <video
                key={current.url}
                ref={videoRef}
                className="h-full w-full object-cover"
                playsInline
                poster={current.poster}
                onEnded={() => setPlaying(false)}
              >
                <source src={current.url} type="video/mp4" />
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

              {videos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => goTo((index - 1 + videos.length) % videos.length)}
                    aria-label="Previous video"
                    className="absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-brass/70 bg-ink/45 text-brass transition-colors hover:bg-ink hover:text-white"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo((index + 1) % videos.length)}
                    aria-label="Next video"
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center border border-brass/70 bg-ink/45 text-brass transition-colors hover:bg-ink hover:text-white"
                  >
                    <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </>
              ) : null}
            </div>

            {videos.length > 1 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {videos.map((video, i) => (
                  <button
                    key={video.url}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Show video ${i + 1}`}
                    aria-current={i === index}
                    className={`border px-3 py-1.5 text-xs transition-colors ${
                      i === index
                        ? 'border-brass bg-brass text-ink'
                        : 'border-white/25 text-white/70 hover:border-brass hover:text-brass'
                    }`}
                  >
                    {video.caption || `Video ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {current.caption && (
              <p className="mt-3 text-center text-sm text-white/60">{current.caption}</p>
            )}
        </div>
      ) : null}
    </Section>
  )
}
