'use client'

import Image from '@/components/ui/Image'
import { Star } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { RichTextValue } from '@/lib/richText'
import type { CollectionTestimonial } from '@/lib/testimonialsCollection.server'

const sourceIcon: Record<string, string> = {
  Google: '/social/Google.png',
  Yelp: '/social/Yelp.png',
}

export type TestimonialsSpotlightProps = {
  /**
   * Reviews to scroll through. These are Testimonials collection records —
   * the Payload equivalent of the WordPress slider's query loop over the
   * `testimonial` post type. The component never fetches or invents them.
   */
  reviews: CollectionTestimonial[]
  eyebrow?: string
  heading?: string
  body?: RichTextValue
  ctaLabel?: string
  ctaHref?: string
  ctaNote?: string
  ctaNoteHref?: string
  /** Small label above the marquee ("What homeowners are saying"). */
  panelLabel?: string
  /** Line under it, e.g. "4.9 stars on Google · 4.9 stars on Yelp". */
  panelNote?: string
}

/**
 * "Testimonials that Matter / Real Results, Real People" — the scrolling
 * review marquee.
 *
 * Presentational only: every string and every review arrives as a prop, so an
 * empty CMS field renders empty rather than falling back to copy baked into
 * this file.
 */
export function TestimonialsSpotlight({
  reviews,
  eyebrow,
  heading,
  body,
  ctaLabel,
  ctaHref,
  ctaNote,
  ctaNoteHref,
  panelLabel,
  panelNote,
}: TestimonialsSpotlightProps) {
  if (!reviews.length) return null

  // Duplicated once so the loop point is invisible — the animation
  // scrolls exactly one copy's height, then resets seamlessly.
  const marqueeReviews = [...reviews, ...reviews]
  const durationSeconds = reviews.length * 5

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-5 max-w-xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink-2 md:text-7xl">
              {heading}
            </h2>
          ) : null}
          {body ? (
            <div className="mt-8 max-w-xl text-lg leading-8 text-ink-2/75 [&_p]:mt-5 [&_p:first-child]:mt-0">
              <RichTextContent data={body} />
            </div>
          ) : null}
          {ctaLabel || ctaNote ? (
            <div className="mt-9 flex flex-wrap items-center gap-5">
              {ctaLabel && ctaHref ? (
                <Button
                  href={ctaHref}
                  variant="primary"
                  size="lg"
                  className="border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white"
                >
                  {ctaLabel} <span aria-hidden>→</span>
                </Button>
              ) : null}
              {ctaNote ? (
                <Button href={ctaNoteHref ?? '/contact'} variant="line" className="text-ink-2">
                  {ctaNote}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="relative min-w-0 border border-line bg-white p-7 md:p-10">
          {panelLabel ? (
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">
              {panelLabel}
            </p>
          ) : null}
          {panelNote ? <p className="mt-3 text-sm text-ink-2/70">{panelNote}</p> : null}

          <div className="group/marquee relative mt-8 h-[420px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
            <div
              className="flex flex-col gap-4 [animation:testimonial-marquee_var(--marquee-duration)_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
              style={{ '--marquee-duration': `${durationSeconds}s` } as React.CSSProperties}
            >
              {marqueeReviews.map((review, index) => (
                <article key={index} className="flex flex-col border border-line bg-paper p-4">
                  <p className="break-words text-base leading-6 text-ink-2/80">
                    &ldquo;{review.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex shrink-0 items-end justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-2">{review.name}</p>
                      {review.source ? (
                        <div className="mt-1 flex items-center gap-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-ink-2/50">
                            {review.source}
                          </p>
                          {sourceIcon[review.source] ? (
                            <Image
                              src={sourceIcon[review.source]}
                              alt={`${review.source} review`}
                              width={54}
                              height={20}
                              className="h-4 w-auto object-contain"
                            />
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                    {review.rating ? (
                      <span
                        className="flex items-center gap-0.5 text-brass"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {Array.from({ length: Math.round(review.rating) }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes testimonial-marquee {
          from {
            transform: translateY(0);
          }
          to {
            transform: translateY(-50%);
          }
        }
      `}</style>
    </Section>
  )
}
