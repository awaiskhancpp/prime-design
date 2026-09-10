'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

export type TestimonialCard = {
  name: string
  quote: string
  avatar?: string
}

/**
 * One review card: five stars, the quote (clamped to six lines with a
 * "Read more" toggle that only appears when the quote actually overflows),
 * then the reviewer's name with their avatar.
 */
function TestimonialCardItem({ testimonial }: { testimonial: TestimonialCard }) {
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)

  useEffect(() => {
    const el = quoteRef.current
    if (!el || expanded) return
    // While clamped, scrollHeight reports the full content height, so a
    // quote taller than its clamped box is the overflow signal.
    setOverflowing(el.scrollHeight > el.clientHeight + 2)
  }, [expanded, testimonial.quote])

  return (
    <figure className="flex h-full flex-col border border-line bg-white p-8">
      <div className="flex items-center gap-0.5 text-brass" aria-label="5 out of 5 stars">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-4 w-4 fill-current" aria-hidden />
        ))}
      </div>
      <blockquote
        ref={quoteRef}
        className={cn('mt-5 text-sm leading-7 text-ink-2/75', !expanded && 'line-clamp-6')}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="mt-3 self-start text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      )}
      <figcaption className="mt-auto flex items-center gap-3 pt-7">
        {testimonial.avatar ? (
          <Image
            src={testimonial.avatar}
            alt={testimonial.name}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-2 font-display text-xs text-ink-2"
          >
            {testimonial.name
              .split(' ')
              .map((part) => part[0])
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </div>
        )}
        <p className="font-semibold text-ink">{testimonial.name}</p>
      </figcaption>
    </figure>
  )
}

/**
 * Testimonial card grid — the Shaker Kitchen page's three review cards
 * (Isabel E., Christian F., James G.) matching the WordPress Testimonial
 * Grid Alpha: five stars, the review quote, then the reviewer's name with
 * their avatar. Content comes from the Payload `testimonialCards` group on
 * the service.
 */
export function ServiceTestimonialCardsSection({ items }: { items: TestimonialCard[] }) {
  if (!items.length) return null

  return (
    <Section className="">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {items.map((testimonial) => (
          <TestimonialCardItem key={testimonial.name} testimonial={testimonial} />
        ))}
      </div>
    </Section>
  )
}
