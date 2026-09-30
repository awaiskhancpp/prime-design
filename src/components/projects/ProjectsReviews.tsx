'use client'

import Image from '@/components/ui/Image'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Star } from 'lucide-react'

import { Section } from '@/components/ui/Section'

/** One review, as the `testimonials` collection hands it over. */
export type ReviewTestimonial = {
  author: string
  source: string
  rating: number
  summary: string
  timeAgo?: string
}

/**
 * The platform marks, from Site Settings → Reviews. Keyed by platform rather
 * than by URL so a review only has to say where it came from.
 */
export type ReviewSourceIcons = {
  google?: string
  yelp?: string
}

/** The headline figures, from Site Settings → Reviews. */
export type ReviewSummary = {
  googleRating?: number
  googleReviewCount?: number
  yelpRating?: number
  yelpReviewCount?: number
}

/** Which source icon a stored `source` maps to. */
function sourceKey(source: string): keyof ReviewSourceIcons | undefined {
  const value = source.trim().toLowerCase()
  if (value.includes('yelp')) return 'yelp'
  if (value.includes('google')) return 'google'
  return undefined
}

/**
 * Static platform trust badges.
 *
 * Brand assets from `public/social/` — nothing per-page about them so they
 * stay as files rather than becoming CMS upload fields nobody will change.
 */
const reviewBadges = [
  { src: '/social/Yelp.png', alt: 'Yelp five-star rating' },
  { src: '/social/Google.png', alt: 'Google five-star rating' },
  { src: '/social/houzz.png', alt: 'Houzz five-star rating' },
  { src: '/social/BB-ACCREDITED.jpeg', alt: 'BBB accredited business' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * "See what people in {City} are saying about us".
 *
 * Redesigned as a centered heading + full-width badge strip + horizontal
 * 3-column card grid. The Swiper has been removed in favour of a static
 * grid — all reviews are visible at once, which performs better for trust
 * and SEO.
 *
 * Section structure (top → bottom):
 *   1. SectionHeader (size="xl", align="center") — city in brass via titleHighlight
 *   2. Aggregate rating row — score + five stars + review count
 *   3. Badge strip (border-y) — Yelp / Google / Houzz / BBB as static images
 *   4. 3-column card grid
 *
 * Card anatomy (top → bottom):
 *   1. 2px brass accent bar — brand colour anchor, sibling div (no CSS border-color fight)
 *   2. ★★★★★ + platform mark (from sourceIcons, CMS-managed)
 *   3. Large decorative " glyph (font-display, brass/15 opacity) + review text
 *      text-sm leading-7 gives ~156 chars a comfortable 3–4 line cadence
 *   4. Author footer pinned to bottom (mt-auto on blockquote) — initials circle + name + time-ago
 *
 * Badge strip placement: sits between the aggregate rating and the cards so
 * the reader sees "4.9 stars → trusted on these platforms → here's who said it"
 * in one top-to-bottom scan rather than having trust signals buried in a column.
 */
export function ProjectsReviews({
  testimonials,
  sourceIcons,
  summary,
  city,
}: {
  testimonials: ReviewTestimonial[]
  sourceIcons?: ReviewSourceIcons
  summary?: ReviewSummary
  /** City name for the WordPress "{acf_city}" heading on location pages. */
  city?: string
}) {
  const totalReviews = (summary?.googleReviewCount ?? 0) + (summary?.yelpReviewCount ?? 0)
  const rating = summary?.googleRating ?? summary?.yelpRating

  // The city is the naturally highlighted phrase — titleHighlight passes it
  // directly to HighlightedText, which renders it in brass on ink backgrounds.
  const resolvedCity = city ?? 'Silicon Valley'

  return (
    <Section className="bg-white">

      {/* ── Heading ──────────────────────────────────────────────────────── */}
      {/*
        size="xl" is documented for "the testimonials spotlight" — exactly
        this. align="center" handles mx-auto + text-center internally so no
        wrapper div is needed. titleHighlight renders the city in brass via
        HighlightedText without a manual <span>.
      */}
      <SectionHeader
        align="center"
        size="xl"
        title={`See what people in ${resolvedCity} are saying about us`}
        titleHighlight={resolvedCity}
      />

      {/* ── Aggregate rating ─────────────────────────────────────────────── */}
      {(rating || totalReviews > 0) ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {rating ? (
            <span className="font-display text-2xl font-medium tabular-nums text-ink">
              {rating}
            </span>
          ) : null}
          <span className="flex items-center gap-0.5 text-brass" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </span>
          {totalReviews > 0 ? (
            <span className="text-sm text-ink-2/60">
              — based on {totalReviews} verified reviews
            </span>
          ) : null}
        </div>
      ) : null}

      {/* ── Trust badge strip ────────────────────────────────────────────── */}
      {/*
        Static images from public/social/ — the per-card platform marks are
        CMS-managed (sourceIcons); these badges are brand assets that never
        change and don't belong in the CMS.
      */}
      <div className="mt-10 flex flex-wrap items-center justify-center gap-10 border-y border-line py-8">
        {reviewBadges.map((badge) => (
          <Image
            key={badge.src}
            src={badge.src}
            alt={badge.alt}
            width={80}
            height={80}
            className="h-10 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
          />
        ))}
      </div>

      {/* ── Review grid ──────────────────────────────────────────────────── */}
      <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => {
          const icon = sourceIcons?.[sourceKey(testimonial.source) ?? 'google']
          return (
            <div
              key={`${testimonial.author}-${index}`}
              className="flex flex-col border border-line bg-paper"
            >
              {/* 2px brass bar — colour anchor. A sibling <div> avoids the
                  border-t-2 + border-line CSS ordering problem entirely. */}
              <div aria-hidden="true" className="h-0.5 shrink-0 bg-brass" />

              <div className="flex flex-1 flex-col gap-4 px-6 py-5">

                {/* ── Stars + platform mark ───────────────────────────── */}
                <div className="flex items-center justify-between">
                  <span
                    className="flex items-center gap-0.5 text-brass"
                    aria-label={`${testimonial.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>

                  {/* CMS-managed platform mark — no mark, no logo. Fine. */}
                  {icon ? (
                    <Image
                      src={icon}
                      alt={testimonial.source}
                      width={48}
                      height={18}
                      className="h-4 w-auto object-contain opacity-60"
                    />
                  ) : null}
                </div>

                {/* ── Review text ─────────────────────────────────────── */}
                {/*
                  The large " glyph (font-display, brass/15) gives typographic
                  mass without competing with copy. -mt-2 pulls the paragraph
                  up into the glyph's optical descender space so the gap between
                  the mark and the first word stays tight. text-sm leading-7
                  gives ~156 chars a comfortable 3–4 line cadence at card width.
                */}
                <blockquote className="flex-1">
                  <span
                    aria-hidden="true"
                    className="block select-none font-display text-4xl leading-none text-brass/15"
                  >
                    &ldquo;
                  </span>
                  <p className="-mt-2 text-sm leading-7 text-ink-2/80">
                    {testimonial.summary}
                  </p>
                </blockquote>

                {/* ── Author footer ───────────────────────────────────── */}
                <footer className="mt-auto flex items-center gap-3 border-t border-line pt-4">
                  <div
                    aria-hidden="true"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-paper-2 font-display text-[11px] font-semibold text-ink-2"
                  >
                    {initials(testimonial.author)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-snug text-ink-2">
                      {testimonial.author}
                    </p>
                    {testimonial.timeAgo ? (
                      <p className="mt-0.5 text-xs text-ink-2/50">{testimonial.timeAgo}</p>
                    ) : null}
                  </div>
                </footer>

              </div>
            </div>
          )
        })}
      </div>

    </Section>
  )
}
