'use client'

import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'

import { cn } from '@/lib/utils'

export type CarouselVideo = {
  url: string
  poster?: string
  caption?: string
}

export function VideoCarousel({
  videos,
  dark = false,
}: {
  videos: CarouselVideo[]
  dark?: boolean
}) {
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const active = videos[index]

  if (!active) return null

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

  const controlButtonClass = cn(
    'flex h-9 w-9 items-center justify-center border transition-colors',
    dark
      ? 'border-white/25 text-white/80 hover:border-brass hover:text-brass'
      : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
  )

  return (
    <div>
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden border bg-black',
          dark ? 'border-white/10' : 'border-line',
        )}
      >
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
      </div>

      {/* Single control bar: play/pause, prev, numbered tabs, next. */}
      <div className="mt-4 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause video' : 'Play video'}
          className={controlButtonClass}
        >
          {playing ? (
            <Pause className="h-4 w-4 fill-current" aria-hidden />
          ) : (
            <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
          )}
        </button>

        {videos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((index - 1 + videos.length) % videos.length)}
              aria-label="Previous video"
              className={controlButtonClass}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>

            <div className="flex items-center gap-1.5" role="tablist" aria-label="Videos">
              {videos.map((video, i) => (
                <button
                  key={video.url}
                  type="button"
                  role="tab"
                  onClick={() => goTo(i)}
                  aria-label={video.caption || `Video ${i + 1}`}
                  aria-selected={i === index}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center border text-sm font-medium transition-colors',
                    i === index
                      ? 'border-brass bg-brass text-white'
                      : dark
                        ? 'border-white/25 text-white/70 hover:border-brass hover:text-brass'
                        : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTo((index + 1) % videos.length)}
              aria-label="Next video"
              className={controlButtonClass}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </>
        )}
      </div>

      {active.caption ? (
        <p className={cn('mt-2 text-center text-sm', dark ? 'text-white/60' : 'text-ink-2/60')}>
          {active.caption}
        </p>
      ) : null}
    </div>
  )
}
