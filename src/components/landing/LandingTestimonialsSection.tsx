'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { cn } from '@/lib/utils'

type Review = {
  reviewer?: string
  rating?: number
  body?: string
  date?: string
  isExcerpt?: boolean
}

type Provider = {
  name: string
  collectionId?: string
  rating?: number
  reviewCount?: number
  reviews: Review[]
}

/** Every review supplied by the CMS is rendered in its provider column. */

/**
 * Cards are as tall as their own review; the duration is worked out from how
 * tall the column therefore is.
 *
 * Those two facts go together. A CSS marquee travels one copy of its own
 * content per cycle, so a fixed duration makes a taller column move faster —
 * and these two are nowhere near the same height. Google's reviews arrive in
 * full (187 to 2,593 characters, median 470), while older embedded Yelp
 * rows were often only excerpts. With a flat
 * duration the Google column ran at 38px a second against Yelp's 17, which
 * side by side read as a fault.
 *
 * So the height is estimated from the text — the same quantity the travel
 * distance depends on — and the duration follows from it. The pixels cancel
 * out and both columns move at `TARGET_PX_PER_SECOND` whatever they contain.
 *
 * The estimate only has to be proportional, not exact, and it is measured
 * from the rendered page rather than guessed: a quote column is 505px wide
 * from `md`, which takes about 78 characters of `text-sm` to the line, and
 * the stars, caption and padding come to 98px on every card however long its
 * quote is.
 *
 * Those are the DESKTOP figures on purpose. A phone wraps the same quote at
 * about 39 characters, so the two breakpoints need different estimates and a
 * server component can only send one — but on a phone the columns are stacked
 * and never on screen together, so a difference in their speeds cannot be
 * seen. The numbers are tuned for the layout where it can.
 */
const CLAMP_LINES = 5
const LINE_HEIGHT_PX = 24
const CHARS_PER_LINE = 78
const CARD_CHROME_PX = 98

/**
 * Roughly how many characters fit before the clamp bites, per breakpoint.
 *
 * A quote column is 505px wide from `md` and about 275px on a phone, which is
 * ~78 and ~39 characters to the line, so the same review can be clamped on a
 * phone and not on a desktop. "Read more" has to follow the clamp rather than
 * the review, so each card decides separately for each breakpoint and shows or
 * hides the control with `md:` — rather than guessing once and being wrong at
 * one of the two widths.
 */
const CLAMPED_ABOVE_CHARS = { mobile: CLAMP_LINES * 39, desktop: CLAMP_LINES * CHARS_PER_LINE }

/**
 * 20px a second: slow enough to read a review as it passes, which is the only
 * reason to move them at all. The section used to run at 6s a card, which read
 * as a ticker rather than as something anybody was meant to look at.
 */
const TARGET_PX_PER_SECOND = 20
/** However few the reviews, a loop this quick would still be a flicker. */
const MIN_DURATION_SECONDS = 45

/** What one review's card comes to on screen, clamp included. */
function estimateCardHeight(review: Review) {
  const characters = review.body?.length ?? 0
  const lines = Math.min(CLAMP_LINES, Math.max(1, Math.ceil(characters / CHARS_PER_LINE)))
  return CARD_CHROME_PX + lines * LINE_HEIGHT_PX
}

/**
 * The review wall on the Google Ads landing pages.
 *
 * Every page carries exactly two providers, Google and Yelp, so they get a
 * column each and are labelled as what they are — the reviews are not pooled,
 * because "4.9 on Google, from 56 reviews" is a different claim from the same
 * number on Yelp, and a visitor who trusts one platform wants to see that one.
 * The columns travel against each other, up on the left and down on the right,
 * which reads as two independent feeds rather than one long list cut in half.
 *
 * The scrolling itself is CSS — two keyframes, a hover pause, and
 * `prefers-reduced-motion` honoured — so the wall costs nothing to animate.
 * The one piece of JavaScript is the inline "Read more" accordion. It follows
 * the Testimonials page: opening a review grows that card in normal document
 * flow, and the same control changes to "Show less". It is deliberately not a
 * modal or an absolutely positioned panel inside the moving column.
 *
 * Nothing here links out. These pages carry no navigation — the only way off
 * them is the phone number and the form — so the platform names are text, not
 * links to a Google or Yelp profile.
 */
export function LandingTestimonialsSection({
  eyebrow,
  heading,
  description,
  providers,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  providers: Provider[]
}) {
  const usable = providers.filter((provider) => provider.reviews.length > 0)
  /** `${provider}-${position}` of the one review being read, if any. */
  const [openReview, setOpenReview] = useState<string | null>(null)

  if (!usable.length) return null

  return (
    <Section className="bg-white">
      {heading || eyebrow || description ? (
        <SectionHeader
          align="center"
          eyebrow={eyebrow}
          title={heading ?? ''}
          description={description}
          size="lg"
          className="mb-12"
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {usable.map((provider, index) => {
          const reviews = provider.reviews
          // A single review has nothing to scroll past; it just sits there.
          const canLoop = reviews.length > 1
          const loop = canLoop ? [...reviews, ...reviews] : reviews
          const columnHeight = reviews.reduce(
            (total, review) => total + estimateCardHeight(review),
            0,
          )
          const duration = `${Math.max(
            MIN_DURATION_SECONDS,
            Math.round(columnHeight / TARGET_PX_PER_SECOND),
          )}s`
          // First column up, second down, and any further provider alternates.
          const goesUp = index % 2 === 0
          const openInThisColumn = openReview?.startsWith(`${provider.name}-`) ?? false

          return (
            <article
              key={provider.name}
              className="flex min-w-0 flex-col border border-line bg-white"
            >
              <header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4 sm:px-6">
                <div className="min-w-0">
                  <p className="font-display text-lg font-medium text-ink-2">{provider.name}</p>
                  {provider.reviewCount ? (
                    <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-ink-2/50">
                      {provider.reviewCount} reviews
                    </p>
                  ) : null}
                </div>
                {provider.rating ? (
                  <div className="flex shrink-0 flex-col items-end">
                    <span
                      className="flex gap-0.5 text-brass"
                      aria-label={`${provider.rating} out of 5 on ${provider.name}`}
                    >
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star key={star} className="h-3.5 w-3.5 fill-current" aria-hidden />
                      ))}
                    </span>
                    <span className="mt-1 font-display text-sm font-semibold text-ink-2">
                      {provider.rating}
                    </span>
                  </div>
                ) : null}
              </header>

              {/*
                Shorter on a phone: two of these stacked is the whole screen,
                and 420px each made the section a scroll of its own. The mask
                fades both ends so cards arrive and leave rather than being
                clipped by a hard edge.
              */}
              <div className="group/column relative h-[340px] overflow-hidden p-4 sm:h-[400px] sm:p-5 lg:h-[460px] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
                <div
                  className={cn(
                    'review-column flex flex-col gap-4 will-change-transform',
                    canLoop && (goesUp ? 'animate-review-up' : 'animate-review-down'),
                    canLoop && 'group-hover/column:[animation-play-state:paused]',
                    // Held still while one of its own reviews is being read.
                    openInThisColumn && '[animation-play-state:paused]',
                  )}
                  style={{ animationDuration: duration }}
                >
                  {loop.map((review, position) => {
                    const key = `${provider.name}-${position}`
                    const length = review.body?.length ?? 0
                    const clamped =
                      !review.isExcerpt &&
                      (length > CLAMPED_ABOVE_CHARS.mobile || length > CLAMPED_ABOVE_CHARS.desktop)
                        ? {
                            mobile: length > CLAMPED_ABOVE_CHARS.mobile,
                            desktop: length > CLAMPED_ABOVE_CHARS.desktop,
                          }
                        : null
                    const open = openReview === key

                    return (
                      <figure
                        key={`${provider.name}-${position}`}
                        className="relative border border-line bg-paper p-4 sm:p-5"
                      >
                        <span
                          className="flex gap-0.5 text-brass"
                          aria-label={`${review.rating || 5} out of 5 stars`}
                        >
                          {Array.from({ length: review.rating || 5 }).map((_, star) => (
                            <Star key={star} className="h-3 w-3 fill-current" aria-hidden />
                          ))}
                        </span>
                        {/* Clamped but NOT reserved. A card is as tall as its
                          own review: a two-line quote makes a short card. The
                          clamp is still there to stop the longest Google
                          review — 2,593 characters, some thirty lines — from
                          being taller than the column that holds it. */}
                        <blockquote
                          className={cn(
                            'mt-3 break-words text-sm leading-6 text-ink-2/80',
                            !open && !review.isExcerpt && 'line-clamp-5',
                          )}
                        >
                          {review.body}
                        </blockquote>

                        {clamped ? (
                          <button
                            type="button"
                            onClick={() =>
                              setOpenReview((current) => (current === key ? null : key))
                            }
                            aria-expanded={open}
                            className={cn(
                              'mt-3 text-sm font-semibold text-brass-deep underline underline-offset-4 transition-colors hover:text-brass focus-visible:outline-2 focus-visible:outline-brass',
                              clamped.mobile ? 'inline-block' : 'hidden',
                              clamped.desktop ? 'md:inline-block' : 'md:hidden',
                            )}
                          >
                            {open ? 'Show less' : 'Read more'}
                          </button>
                        ) : null}
                      </figure>
                    )
                  })}
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
