import Image from 'next/image'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import website from '../../../website.json'
import type { Testimonial } from '@/lib/testimonials'
import { TestimonialsSpotlight } from './TestimonialsSpotlight'
import { TestimonialVideos } from './TestimonialVideos'
import { PageHero } from '../layout/PageHero'

const reviewBadges = [
  { src: '/social/Yelp.png', alt: 'Yelp rating' },
  { src: '/social/Google.png', alt: 'Google rating' },
  { src: '/social/houzz.png', alt: 'Houzz rating' },
  { src: '/social/BB-ACCREDITED.jpeg', alt: 'BBB accredited business' },
]

// Curated set — these are the only reviews shown on this page.
// The rest of the archive lives in Google/Yelp directly (linked below),
// not dumped into this page's DOM.
const featuredReviews: Testimonial[] = [
  {
    name: 'Edward L.',
    text: 'I hired Prime to renovate my kitchen - countertops, backsplash, cabinets, electrical, freezer, etc. They also helped install a new bidet toilet for...',
    date: '5 months ago',
    source: 'yelp',
    rating: 5,
  },
  {
    name: 'David W.',
    text: "Change is very difficult.  It's also costly.  And scary even.  This company took the sting out of it.  They aren't the cheapest out there, but once you see...",
    date: '11 months ago',
    source: 'yelp',
    rating: 5,
  },
  {
    name: 'Hanyu C.',
    text: "We recently finished converting a second dining room to a guest suite with Prime Design and Build, and I honestly couldn't be happier with how everything...",
    date: '11 months ago',
    source: 'yelp',
    rating: 5,
  },
  {
    name: 'Dennis Randall',
    text: "I couldn't be happier with how my kitchen turned out after the renovation. It was my first time working with them, and their outstanding customer service and reasonable pricing have ensured I'll be using them for future projects. I highly recommend them for any home renovation, inside or out—they really know their stuff.",
    date: 'a year ago',
    source: 'google',
    rating: 5,
  },
  {
    name: 'Arika',
    text: 'Prime Design was excellent. We love our new bathroom. Ilay, the project manager, was professional and very responsible. While they were actually working as...',
    date: '2 years ago',
    source: 'yelp',
    rating: 5,
  },
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
  const { reviewSummary } = website

  return (
    <div className="min-h-screen bg-paper">
      <SiteHeader tone="dark" />
      <PageHero
        eyebrow="Testimonials"
        title="Hear from our satisfied customers"
        image="/services/kitchen-remodeling.jpeg"
        imageAlt=""
        description="From kitchen remodels to complete home renovations, our clients share what it feels like
            to work with Prime Design & Build."
      />

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
        <div className="mt-10 grid gap-4 text-center text-sm text-ink-2/70 sm:grid-cols-2">
          <p>
            <strong className="block font-display text-4xl text-brass">
              {reviewSummary.google.rating}★ ({reviewSummary.google.count})
            </strong>
            Google reviews
          </p>
          <p>
            <strong className="block font-display text-4xl text-brass">
              {reviewSummary.yelp.rating}★ ({reviewSummary.yelp.count})
            </strong>
            Yelp reviews
          </p>
        </div>
      </Section>

      <Section className="bg-white pt-0">
        <div className="">
          <div className="columns-1 md:columns-2 md:gap-4">
            {featuredReviews.map((review) => (
              <article
                key={`${review.source}-${review.name}-${review.date}`}
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

          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
            <a
              href={reviewSummary.google.url}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-5 py-3 font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
            >
              Read all reviews on Google
            </a>
            <a
              href={reviewSummary.yelp.url}
              target="_blank"
              rel="noreferrer"
              className="border border-line px-5 py-3 font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
            >
              Read all reviews on Yelp
            </a>
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
