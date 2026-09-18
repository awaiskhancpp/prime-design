'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import BeforeAfterSlider from '@/components/blocks/BeforeAfterSlider'
import { cn } from '@/lib/utils'

import { VideoCarousel, type CarouselVideo } from './VideoCarousel'

export type BeforeAfterComparison = {
  before: string
  after: string
  beforeLabel?: string
  afterLabel?: string
  caption?: string
}

/**
 * PrimeDifferenceMedia
 *
 * The media column of the Prime Difference section. WordPress fills it in one
 * of two ways depending on the page: most pages put a slider of project
 * videos there, while the siding and outdoor-hardscape pages put a
 * before/after comparison there instead (an `xbeforeafterimage` element in a
 * Bricks section that immediately follows the Prime Difference section — the
 * same "one section authored as two roots" shape the video carousel uses).
 *
 * So this renders whichever the page actually has, and offers a switch when a
 * page has both. It does not own either widget: videos go through the
 * existing `VideoCarousel` and comparisons through the existing
 * `BeforeAfterSlider` that the homepage uses, so there is only one
 * implementation of each on the site.
 *
 * The comparison frame is passed classes matching the video frame — 16:9 and
 * a light hairline — so switching between the two does not change the
 * column's height or its weight against the dark panel.
 */

const FRAME = 'aspect-video border border-white/10'

const controlButtonClass =
  'flex h-9 w-9 items-center justify-center border border-white/25 text-white/80 transition-colors hover:border-brass hover:text-brass'

function ComparisonCarousel({ comparisons }: { comparisons: BeforeAfterComparison[] }) {
  const [index, setIndex] = useState(0)
  const active = comparisons[Math.min(index, comparisons.length - 1)]
  if (!active) return null

  return (
    <div>
      <BeforeAfterSlider
        key={`${active.before}-${active.after}`}
        beforeImage={active.before}
        afterImage={active.after}
        beforeAlt={active.beforeLabel || 'Before'}
        afterAlt={active.afterLabel || 'After'}
        className={FRAME}
      />

      {/* The source labels its two halves ("Before" / "After"); keep them
          visible rather than relying on the handle alone to explain it. */}
      <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
        <span>{active.beforeLabel || 'Before'}</span>
        <span>{active.afterLabel || 'After'}</span>
      </div>

      {comparisons.length > 1 ? (
        <div className="mt-3 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setIndex((i) => (i - 1 + comparisons.length) % comparisons.length)}
            aria-label="Previous comparison"
            className={controlButtonClass}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <div className="flex items-center gap-1.5" role="tablist" aria-label="Before and after">
            {comparisons.map((comparison, i) => (
              <button
                key={`${comparison.before}-${i}`}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={comparison.caption || `Comparison ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'flex h-9 w-9 items-center justify-center border text-sm font-medium transition-colors',
                  i === index
                    ? 'border-brass bg-brass text-white'
                    : 'border-white/25 text-white/70 hover:border-brass hover:text-brass',
                )}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((i) => (i + 1) % comparisons.length)}
            aria-label="Next comparison"
            className={controlButtonClass}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}

      {active.caption ? (
        <p className="mt-2 text-center text-sm text-white/60">{active.caption}</p>
      ) : null}
    </div>
  )
}

export function PrimeDifferenceMedia({
  videos = [],
  comparisons = [],
}: {
  videos?: CarouselVideo[]
  comparisons?: BeforeAfterComparison[]
}) {
  const hasVideos = videos.length > 0
  const hasComparisons = comparisons.length > 0
  const [view, setView] = useState<'videos' | 'comparisons'>(
    hasVideos ? 'videos' : 'comparisons',
  )

  // Nothing to show. Returning null rather than a placeholder keeps an
  // unwired section visibly empty instead of looking populated.
  if (!hasVideos && !hasComparisons) return null

  // Only one kind on this page: render it with no switcher at all.
  if (!hasVideos) return <ComparisonCarousel comparisons={comparisons} />
  if (!hasComparisons) return <VideoCarousel videos={videos} dark />

  const showing = view === 'videos' ? 'videos' : 'comparisons'
  return (
    <div>
      <div
        role="tablist"
        aria-label="Project media"
        className="mb-4 flex items-center gap-2"
      >
        {(['videos', 'comparisons'] as const).map((value) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={showing === value}
            onClick={() => setView(value)}
            className={cn(
              'border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition-colors',
              showing === value
                ? 'border-brass bg-brass text-white'
                : 'border-white/25 text-white/70 hover:border-brass hover:text-brass',
            )}
          >
            {value === 'videos' ? 'Project videos' : 'Before & after'}
          </button>
        ))}
      </div>

      {showing === 'videos' ? (
        <VideoCarousel videos={videos} dark />
      ) : (
        <ComparisonCarousel comparisons={comparisons} />
      )}
    </div>
  )
}
