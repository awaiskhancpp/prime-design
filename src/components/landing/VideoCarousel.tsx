'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

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
  const active = videos[index]

  if (!active) return null

  const goTo = (nextIndex: number) => setIndex(nextIndex)

  const controlButtonClass = cn(
    'flex h-9 w-9 items-center justify-center border transition-colors',
    dark
      ? 'border-white/25 text-white/80 hover:border-brass hover:text-brass'
      : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
  )

  return (
    <div>
      {/* The picture and its play/pause belong to `VideoPlayer`, so this
          carousel is not a second implementation of the same control — it
          only owns moving between clips. Keyed on the url so switching clip
          remounts the element rather than swapping the source underneath a
          player that still thinks it is mid-playback. */}
      <VideoPlayer
        key={active.url}
        src={active.url}
        poster={active.poster}
        label={active.caption || 'video'}
        className={cn('aspect-video w-full border', dark ? 'border-white/10' : 'border-line')}
      />

      {/* Carousel chrome only: prev, numbered tabs, next. */}
      <div className="mt-4 flex items-center justify-center gap-2">
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
