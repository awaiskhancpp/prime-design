import Image from 'next/image'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { testimonials } from '@/lib/testimonials'
import { TestimonialsSpotlight } from './TestimonialsSpotlight'
import { TestimonialVideos } from './TestimonialVideos'

const reviewBadges = [
  { src: '/social/Yelp.png', alt: 'Yelp rating' },
  { src: '/social/Google.png', alt: 'Google rating' },
  { src: '/social/houzz.png', alt: 'Houzz rating' },
  { src: '/social/BB-ACCREDITED.jpeg', alt: 'BBB accredited business' },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function TestimonialsPage() {
  const googleReviews = testimonials.filter((review) => review.source === 'google')
  const yelpReviews = testimonials.filter((review) => review.source === 'yelp')

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader tone="dark" />
      <Section className="relative isolate flex min-h-screen items-end overflow-hidden bg-ink pt-32 text-white md:pt-40">
        <Image
          src="/services/kitchen-remodeling.jpeg"
          alt="A completed Prime Design & Build kitchen remodeling project"
          fill
          priority
          className="-z-20 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/35" />
        <div className="relative max-w-3xl self-end pb-10 md:pb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">
            Testimonials
          </p>
          <h1 className=" max-w-3xl font-display text-4xl font-medium leading-[0.98] tracking-tight md:text-8xl">
            Hear from our satisfied customers
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
            From kitchen remodels to complete home renovations, our clients share what it feels like
            to work with Prime Design & Build.
          </p>
        </div>
      </Section>

      <TestimonialVideos />

      <Section className="bg-white pt-0">
        <div className="flex flex-wrap items-center justify-center gap-8 border-y border-line py-8">
          {reviewBadges.map((badge) => (
            <Image
              key={badge.src}
              src={badge.src}
              alt={badge.alt}
              width={145}
              height={62}
              className="h-auto w-auto max-w-36 object-contain"
            />
          ))}
        </div>
        <div className="mt-10 grid gap-4 text-center text-sm text-ink-2/70 sm:grid-cols-3">
          <p>
            <strong className="block font-display text-4xl text-brass">
              {testimonials.length}
            </strong>
            published reviews in this source
          </p>
          <p>
            <strong className="block font-display text-4xl text-brass">
              {googleReviews.length}
            </strong>
            Google reviews
          </p>
          <p>
            <strong className="block font-display text-4xl text-brass">{yelpReviews.length}</strong>
            Yelp reviews
          </p>
        </div>
      </Section>

      <Section className="bg-white pt-0">
        <div className="mx-auto max-w-4xl">
          <div className="columns-1 md:columns-2 md:gap-4">
            {testimonials.map((review) => (
              <article
                key={`${review.source}-${review.name}-${review.date}-${review.text.slice(0, 12)}`}
                className="mb-4 inline-block w-full break-inside-avoid border border-line bg-paper p-5 sm:p-6"
              >
                <div className="flex items-center gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-2 text-xs font-semibold text-ink-2">
                    {initials(review.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-ink-2">{review.name}</span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-ink-2/50">
                      {review.source} · {review.date}
                    </span>
                  </span>
                  <span
                    className="shrink-0 text-sm tracking-[0.08em] text-brass"
                    aria-label={`${review.rating} out of 5 stars`}
                  >
                    ★★★★★
                  </span>
                </div>
                <p className="mt-6 text-base leading-7 text-ink-2/75">{review.text}</p>
              </article>
            ))}
          </div>
        </div>
      </Section>
      <TestimonialsSpotlight />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
