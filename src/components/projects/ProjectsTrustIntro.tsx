import { Star } from 'lucide-react'
import Image from 'next/image'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function ProjectsTrustIntro() {
  const { google, yelp } = website.reviewSummary
  const totalReviews = google.count + yelp.count

  return (
    <Section className="bg-white">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            {website.primeDifference.statLine}
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink md:text-7xl">
            Silicon Valley loves working with us!
          </h2>
          <p className="mt-8 max-w-xl text-lg leading-8 text-ink-2/75">
            Our company is committed to creating the best experience possible. Call today to get a
            quote and let&apos;s talk about what you want to build.
          </p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Button href="/our-projects" variant="outline" size="lg">
              See our projects <span aria-hidden>→</span>
            </Button>
            <Button
              href="/contact"
              variant="primary"
              size="lg"
              className="border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white"
            >
              Contact our team <span aria-hidden>→</span>
            </Button>
          </div>
        </div>

        {/* Offset brass frame (same motif as the project-detail hero) instead
            of a frosted panel that ate half the photo. The trust stat is now
            a small floating card anchored to one corner, not a box that
            competes with the image for space. */}
        <div className="relative mb-8 sm:mb-10">
          <div
            className="absolute -bottom-5 -right-5 hidden h-full w-full bg-brass sm:block"
            aria-hidden="true"
          />
          <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
            <Image
              src="/services/kitchen-remodeling.jpeg"
              alt="A Prime Design & Build kitchen remodeling project"
              fill
              className="object-cover"
            />
          </div>

          <div className="absolute -bottom-6 left-6 flex items-center gap-5 border border-line bg-white px-6 py-5 shadow-xl sm:-bottom-8 sm:left-8">
            <div>
              <span className="flex items-center gap-0.5 text-brass" aria-hidden="true">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </span>
              <p className="mt-1 font-display text-3xl font-medium leading-none text-ink">
                {google.rating}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-2/60">
                {totalReviews}+ reviews
              </p>
            </div>
            <div className="h-10 w-px bg-line" aria-hidden="true" />
            <div>
              <p className="font-display text-3xl font-medium leading-none text-ink">350+</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-2/60">
                Projects built
              </p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  )
}
