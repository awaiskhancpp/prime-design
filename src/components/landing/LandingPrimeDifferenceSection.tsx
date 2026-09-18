import { Check } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import { PrimeDifferenceMedia, type BeforeAfterComparison } from './PrimeDifferenceMedia'
import { type CarouselVideo } from './VideoCarousel'

/**
 * LandingPrimeDifferenceSection
 *
 * This component used to carry a complete hardcoded copy of the section —
 * the "Over 350+ Projects in Silicon Valley" stat line, all five checklist
 * bullets, and all five project video URLs with posters — as prop defaults.
 * That made the page look correct whether or not the Payload wiring worked,
 * which is exactly the failure this project has hit before. Everything now
 * comes from the `prime-difference` block; an empty field renders nothing.
 */
type LandingPrimeDifferenceSectionProps = {
  eyebrow?: string
  heading?: string
  body?: string
  checklist?: string[]
  videos?: CarouselVideo[]
  /**
   * Before/after pairs from the `xbeforeafterimage` section WordPress
   * authors directly after this one (siding, outdoor hardscape). They are
   * this section's media column, not a section of their own.
   */
  comparisons?: BeforeAfterComparison[]
}

export function LandingPrimeDifferenceSection({
  eyebrow,
  heading,
  body,
  checklist,
  videos,
  comparisons,
}: LandingPrimeDifferenceSectionProps) {
  const activeChecklist = checklist ?? []
  const activeVideos = videos ?? []
  const activeComparisons = comparisons ?? []
  // Three shapes for this section, and it has to hold up in all of them:
  // a video carousel beside the copy, a before/after comparison beside the
  // copy, or copy alone (the bathroom page). With no media the two-column
  // split would leave half the band empty, so the copy centres instead and
  // the checklist spreads into two columns rather than one tall stack.
  const hasMedia = activeVideos.length > 0 || activeComparisons.length > 0

  return (
    <Section className="bg-ink-2 text-white">
      <div
        className={cn(
          'grid gap-12',
          hasMedia
            ? 'md:grid-cols-12 md:items-center md:gap-10 lg:gap-10'
            : 'mx-auto max-w-4xl text-center',
        )}
      >
        <div className={hasMedia ? 'col-span-6' : undefined}>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">
              {heading}
            </h2>
          ) : null}

          {body ? (
            <p
              className={cn(
                'mt-5 leading-relaxed text-white/75',
                hasMedia ? undefined : 'mx-auto max-w-2xl',
              )}
            >
              {body}
            </p>
          ) : null}

          <ul
            className={cn(
              !activeChecklist.length && 'hidden',
              activeChecklist.length && 'mt-8',
              // Without media the band is full width, so a single column of
              // ticks would run as one thin line down the middle.
              hasMedia
                ? 'space-y-4'
                : 'mx-auto grid max-w-3xl gap-4 text-left sm:grid-cols-2',
            )}
          >
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

        {hasMedia ? (
          <div className="col-span-6">
            <PrimeDifferenceMedia videos={activeVideos} comparisons={activeComparisons} />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
