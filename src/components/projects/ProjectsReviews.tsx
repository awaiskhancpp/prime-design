'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { useRef } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'

import 'swiper/css'

const reviewBadges = [
  { src: '/social/Yelp.png', alt: 'Yelp five-star rating' },
  { src: '/social/Google.png', alt: 'Google five-star rating' },
  { src: '/social/houzz.png', alt: 'Houzz five-star rating' },
  { src: '/social/BB-ACCREDITED.jpeg', alt: 'BBB accredited business' },
]

const sourceIcon: Record<string, string> = {
  Google: '/social/Google.png',
  Yelp: '/social/Yelp.png',
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ProjectsReviews() {
  const { testimonialsFeatured, reviewSummary } = website
  const totalReviews = reviewSummary.google.count + reviewSummary.yelp.count
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <Section className="bg-white pt-0">
      <div className="mx-auto grid  gap-10 lg:grid-cols-12 lg:items-start lg:gap-8">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            See what people in <span className="text-brass">Silicon Valley</span> are saying about
            us
          </h2>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            {reviewBadges.map((badge) => (
              <Image
                key={badge.src}
                src={badge.src}
                alt={badge.alt}
                width={145}
                height={62}
                className="h-auto w-auto  object-contain"
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
                What they say
              </p>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-ink-2/70">
                <span className="font-display text-2xl text-ink">
                  {reviewSummary.google.rating}
                </span>
                <span className="flex items-center gap-0.5 text-brass" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </span>
                <span>Excellent — based on {totalReviews} reviews</span>
              </p>
            </div>
          </div>

          {/* Vertical ticker: 3 cards visible at once. Autoplay drives the
              scroll — the top card exits upward and the next one slides in
              to take its place, on a loop. */}
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
            {testimonialsFeatured.map((testimonial) => (
              <SwiperSlide key={testimonial.author}>
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
                        {sourceIcon[testimonial.source] && (
                          <Image
                            src={sourceIcon[testimonial.source]}
                            alt={`${testimonial.source} review`}
                            width={40}
                            height={16}
                            className="h-3 w-auto object-contain opacity-70"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-ink-2/75 line-clamp-2">
                    &ldquo;{testimonial.summary}&rdquo;
                  </p>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Section>
  )
}
