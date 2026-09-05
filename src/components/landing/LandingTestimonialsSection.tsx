'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

type Review = {
  reviewer?: string
  rating?: number
  body?: string
  date?: string
}

type Provider = {
  name: string
  collectionId?: string
  reviewUrl?: string
  rating?: number
  reviewCount?: number
  reviews: Review[]
}

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
  const usableProviders = providers.filter((provider) => provider.reviews.length > 0)
  const [activeIndex, setActiveIndex] = useState(0)
  const active = usableProviders[Math.min(activeIndex, usableProviders.length - 1)]

  if (!active) return null

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-24">
        <div>
          {eyebrow ? (
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-5 max-w-xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink md:text-7xl">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-8 max-w-xl text-lg leading-8 text-ink-2/75">{description}</p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            {usableProviders.map((provider, index) => (
              <button
                key={provider.name}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'border px-5 py-3 text-sm font-semibold transition-colors',
                  index === activeIndex
                    ? 'border-brass bg-brass text-ink'
                    : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
                )}
              >
                {provider.name} Rating
              </button>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {usableProviders.map((provider) =>
              provider.reviewUrl ? (
                <a
                  key={provider.name}
                  href={provider.reviewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-ink-2 underline decoration-brass underline-offset-4"
                >
                  Read reviews on {provider.name}
                </a>
              ) : null,
            )}
          </div>
        </div>

        <div className="border border-line bg-white p-7 md:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brass">
            What homeowners are saying
          </p>
          <p className="mt-3 text-sm text-ink-2/70">
            {active.rating ? `${active.rating} stars on ${active.name}` : `${active.name} reviews`}
            {active.reviewCount ? ` · ${active.reviewCount} reviews` : ''}
          </p>
          <div className="mt-8 space-y-4">
            {active.reviews.map((review, index) => (
              <article key={`${active.name}-${review.reviewer || 'review'}-${index}`} className="border border-line bg-paper p-5">
                <p className="text-base leading-7 text-ink-2/80">&ldquo;{review.body}&rdquo;</p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-semibold text-ink-2">{review.reviewer}</p>
                    {review.date ? <p className="mt-1 text-xs text-ink-2/50">{review.date}</p> : null}
                  </div>
                  <span className="flex gap-0.5 text-brass" aria-label={`${review.rating || 5} out of 5 stars`}>
                    {Array.from({ length: review.rating || 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
