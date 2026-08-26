'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { Autoplay } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { testimonials } from '@/lib/testimonials'

import 'swiper/css'

const sourceIcon: Record<string, string> = {
  Google: '/social/Google.png',
  Yelp: '/social/Yelp.png',
}

export function TestimonialsSpotlight() {
  const { testimonialsFeatured, reviewSummary } = website
  const spotlightReviews = [
    ...testimonialsFeatured,
    ...testimonials
      .filter((review) => review.source === 'yelp')
      .slice(0, 3)
      .map((review) => ({
        author: review.name,
        source: 'Yelp',
        rating: review.rating,
        summary: review.text,
        timeAgo: review.date,
      })),
  ]

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brass">
            Testimonials that matter
          </p>
          <h2 className="mt-5 max-w-xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink-2 md:text-7xl">
            Real results, real people.
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-2/75">
            See why our clients trust Prime Design & Build with the spaces that matter most to them.
          </p>
          <p className="mt-5 max-w-xl text-lg leading-8 text-ink-2/75">
            Don&apos;t just take our word for it—read how thoughtful planning, clear communication,
            and careful building turn ideas into homes people love.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Button
              href="/our-projects"
              variant="primary"
              size="lg"
              className="border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white"
            >
              See our projects <span aria-hidden>→</span>
            </Button>
            <Button href="/contact" variant="line" className="text-ink-2">
              Ready to talk?
            </Button>
          </div>
        </div>

        <div className="relative min-w-0 border border-line bg-white p-7 pb-0 md:p-10 md:pb-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">
            What homeowners are saying
          </p>
          <p className="mt-3 text-sm text-ink-2/70">
            {reviewSummary.google.rating} stars on Google · {reviewSummary.yelp.rating} stars on
            Yelp
          </p>
          <Swiper
            modules={[Autoplay]}
            direction="vertical"
            loop
            autoplay={{ delay: 1, disableOnInteraction: false, pauseOnMouseEnter: true }}
            speed={4200}
            spaceBetween={10}
            slidesPerView={1}
            className="mt-8 max-h-[290px]"
          >
            {spotlightReviews.map((review, index) => (
              <SwiperSlide key={index}>
                <article className="flex h-full min-h-0 flex-col overflow-hidden border border-line bg-paper p-4">
                  <p className="line-clamp-3 break-words text-base leading-6 text-ink-2/80">
                    &ldquo;{review.summary}&rdquo;
                  </p>
                  <div className="mt-5 flex shrink-0 items-end justify-between gap-4">
                    <div>
                      <p className="font-semibold text-ink-2">{review.author}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-xs uppercase tracking-[0.12em] text-ink-2/50">
                          {review.source}
                        </p>
                        <Image
                          src={sourceIcon[review.source]}
                          alt={`${review.source} review`}
                          width={54}
                          height={20}
                          className="h-4 w-auto object-contain"
                        />
                      </div>
                    </div>
                    <span
                      className="flex items-center gap-0.5 text-brass"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="h-3.5 w-3.5 fill-current" />
                      ))}
                    </span>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </Section>
  )
}
