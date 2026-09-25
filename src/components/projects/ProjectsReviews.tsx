'use client'

import Image from '@/components/ui/Image'
import { Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Autoplay } from 'swiper/modules'
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
 * These are brand assets, not reviews or counts — there is nothing per-page
 * about them, so they stay as files in `public/social/` rather than becoming
 * four more upload fields nobody will ever change.
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
 * Purely presentational: every value — the reviews, the platform marks and the
 * headline rating — arrives as a prop from `ProjectsReviewsSection`, which
 * reads them from Payload. Nothing here falls back to a hardcoded review list,
 * because a fallback that happens to match reality is exactly how a section
 * stops being CMS-driven without anyone noticing.
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
  const swiperRef = useRef<SwiperType | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const totalReviews = (summary?.googleReviewCount ?? 0) + (summary?.yelpReviewCount ?? 0)
  const rating = summary?.googleRating ?? summary?.yelpRating

  return (
    <Section className="bg-white pt-0">
      <div className="mx-auto grid  gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            See what people in <span className="text-brass">{city || 'Silicon Valley'}</span> are
            saying about us
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-12">
            {reviewBadges.map((badge) => (
              <Image
                key={badge.src}
                src={badge.src}
                alt={badge.alt}
                width={90}
                height={90}
                className="h-auto w-auto"
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          {rating || totalReviews ? (
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                  What they say
                </p>
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-2/70">
                  {rating ? <span className="font-display text-2xl text-ink">{rating}</span> : null}
                  <span className="flex items-center gap-0.5 text-brass" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </span>
                  <span>
                    Excellent
                    {totalReviews ? ` — based on ${totalReviews} reviews` : ''}
                  </span>
                </p>
              </div>
            </div>
          ) : null}

          {/* Vertical ticker: 3 cards visible at once. Autoplay drives the
              scroll — the top card exits upward and the next one slides in
              to take its place, on a loop. */}
          {mounted ? (
            <Swiper
              modules={[Autoplay]}
              direction="vertical"
              loop
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper
              }}
              autoplay={{ delay: 1800, disableOnInteraction: false, pauseOnMouseEnter: true }}
              speed={700}
              spaceBetween={16}
              slidesPerView={3}
              className="mt-10 h-[400px]"
            >
              {testimonials.map((testimonial, index) => {
                const icon = sourceIcons?.[sourceKey(testimonial.source) ?? 'google']
                return (
                  <SwiperSlide key={`${testimonial.author}-${index}`}>
                    <div className="flex h-full flex-col justify-center gap-2 border border-line bg-paper px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          aria-hidden="true"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-paper-2 font-display text-xs text-ink-2"
                        >
                          {initials(testimonial.author)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-2">
                            {testimonial.author}
                            {testimonial.timeAgo && (
                              <span className="ml-1.5 text-xs font-normal text-ink-2/50">
                                {testimonial.timeAgo}
                              </span>
                            )}
                          </p>
                          <div className="mt-0.5 flex items-center gap-2">
                            <span
                              className="flex items-center gap-0.5 text-brass"
                              aria-label={`${testimonial.rating} out of 5 stars`}
                            >
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className="h-3 w-3 fill-current" />
                              ))}
                            </span>
                            {/* The platform mark is a Media document from Site
                                Settings; without one the card simply carries
                                no mark rather than a hardcoded logo. */}
                            {icon ? (
                              <Image
                                src={icon}
                                alt={`${testimonial.source} review`}
                                width={40}
                                height={16}
                                className="h-3.5 w-auto object-contain"
                              />
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm leading-6 text-ink-2/75 line-clamp-2">
                        &ldquo;{testimonial.summary}&rdquo;
                      </p>
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>
          ) : (
            <div className="mt-10 h-[400px]" aria-hidden="true" />
          )}
        </div>
      </div>
    </Section>
  )
}
