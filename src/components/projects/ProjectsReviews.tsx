'use client'

import Image from '@/components/ui/Image'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { A11y, Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { Section } from '@/components/ui/Section'

import 'swiper/css'

/** One review, as the `testimonials` collection hands it over. */
export type ReviewTestimonial = {
  author: string
  source: string
  rating: number
  summary: string
  timeAgo?: string
  /** Where the listing the review was left on is, e.g. "San Jose, CA". */
  location?: string
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

/** The profile each trust badge links to, from Site Settings → Social links. */
export type ReviewProfileLinks = {
  googleBusiness?: string
  yelp?: string
  houzz?: string
  bbb?: string
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
const reviewBadges: { src: string; alt: string; link: keyof ReviewProfileLinks }[] = [
  { src: '/social/Yelp.png', alt: 'Yelp five-star rating', link: 'yelp' },
  { src: '/social/Google.png', alt: 'Google five-star rating', link: 'googleBusiness' },
  { src: '/social/houzz.png', alt: 'Houzz five-star rating', link: 'houzz' },
  { src: '/social/BB-ACCREDITED.jpeg', alt: 'BBB accredited business', link: 'bbb' },
]

/** Seconds' worth of reading before the next three reviews slide in. */
const AUTOPLAY_DELAY_MS = 6000

const controlButtonClass =
  'flex h-10 w-10 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep'

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
 * A centered heading + full-width badge strip + a Swiper carousel of review
 * cards, three at a time on desktop, advancing a set of three at once.
 *
 * Section structure (top → bottom):
 *   1. SectionHeader (size="xl", align="center") — city in brass via titleHighlight
 *   2. Aggregate rating row — score + five stars + review count
 *   3. Badge strip (border-y) — Yelp / Google / Houzz / BBB as static images
 *   4. Card carousel + previous/next buttons
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
  profileLinks,
  city,
}: {
  testimonials: ReviewTestimonial[]
  sourceIcons?: ReviewSourceIcons
  summary?: ReviewSummary
  /** Where each trust badge links; a badge with no link renders as a plain image. */
  profileLinks?: ReviewProfileLinks
  /** City name for the WordPress "{acf_city}" heading on location pages. */
  city?: string
}) {
  const swiperRef = useRef<SwiperType | null>(null)
  // No auto-advance for visitors who ask their system for reduced motion;
  // the arrows still page through the reviews.
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReducedMotion(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

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
      {rating || totalReviews > 0 ? (
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
        {reviewBadges.map((badge) => {
          const href = profileLinks?.[badge.link]
          const image = (
            <Image
              src={badge.src}
              alt={badge.alt}
              width={80}
              height={80}
              className="h-10 w-auto object-contain opacity-70 transition-opacity hover:opacity-100"
            />
          )
          return href ? (
            <a
              key={badge.src}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${badge.alt} (opens in a new tab)`}
              className="focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brass"
            >
              {image}
            </a>
          ) : (
            <span key={badge.src}>{image}</span>
          )
        })}
      </div>

      {/* ── Review grid ──────────────────────────────────────────────────── */}
      {/*
        Three reviews at a time on desktop (two on a tablet, one on a phone),
        advancing a whole set at once. `rewind` returns to the first set after
        the last rather than looping, so no review is duplicated to pad the
        track. `h-auto` on the slides lets every card in a set stretch to the
        tallest, so their footers line up. It has to be `!important`: Swiper's
        own `.swiper-slide { height: 100% }` is unlayered CSS, which beats any
        Tailwind utility (those live in `@layer utilities`) whatever the
        selector, and a slide with a fixed height is never stretched.
      */}
      <Swiper
        modules={[Autoplay, A11y]}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        rewind
        autoplay={
          reducedMotion
            ? false
            : { delay: AUTOPLAY_DELAY_MS, disableOnInteraction: false, pauseOnMouseEnter: true }
        }
        speed={700}
        spaceBetween={20}
        slidesPerView={1}
        slidesPerGroup={1}
        breakpoints={{
          640: { slidesPerView: 2, slidesPerGroup: 2 },
          1024: { slidesPerView: 3, slidesPerGroup: 3 },
        }}
        a11y={{
          containerMessage: 'Customer reviews',
          slideLabelMessage: 'Review {{index}} of {{slidesLength}}',
        }}
        onFocus={() => swiperRef.current?.autoplay?.stop()}
        className="mt-10 [&_.swiper-slide]:h-auto!"
      >
        {testimonials.map((testimonial, index) => {
          const icon = sourceIcons?.[sourceKey(testimonial.source) ?? 'google']
          return (
            <SwiperSlide key={`${testimonial.author}-${index}`}>
              <div className="flex h-full flex-col border border-line bg-paper">
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
                    {/* Six lines are reserved (`min-h-42` = 6 × `leading-7`) so a
                      two-line review occupies the same height as a long one and every
                      card's footer lands on the same line. */}
                    <p className="-mt-2 line-clamp-6 min-h-42 text-sm leading-7 text-ink-2/80">
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
                      {testimonial.location || testimonial.timeAgo ? (
                        <p className="mt-0.5 text-xs text-ink-2/50">
                          {[testimonial.location, testimonial.timeAgo].filter(Boolean).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </footer>
                </div>
              </div>
            </SwiperSlide>
          )
        })}
      </Swiper>

      {testimonials.length > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous reviews"
            onClick={() => swiperRef.current?.slidePrev()}
            className={controlButtonClass}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next reviews"
            onClick={() => swiperRef.current?.slideNext()}
            className={controlButtonClass}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </Section>
  )
}
