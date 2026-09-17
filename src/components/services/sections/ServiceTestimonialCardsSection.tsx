'use client'

import Image from 'next/image'
import { Star } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

export type TestimonialCard = {
  name: string
  quote: string
  avatar?: string
}

/** How many lines a supporting quote shows before "Read more" appears. */
const LINE_CLAMP = 'line-clamp-5'

function Avatar({ name, avatar }: { name: string; avatar?: string }) {
  const [failed, setFailed] = useState(false)
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  if (avatar && !failed) {
    return (
      <Image
        src={avatar}
        alt={name}
        width={40}
        height={40}
        onError={() => setFailed(true)}
        className="h-10 w-10 rounded-full object-cover"
      />
    )
  }

  return (
    <div
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brass/10 font-display text-xs font-semibold text-brass-deep"
    >
      {initials}
    </div>
  )
}

function Stars() {
  return (
    <div className="flex items-center gap-0.5 text-brass" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" aria-hidden />
      ))}
    </div>
  )
}

function PrimaryCard({ testimonial }: { testimonial: TestimonialCard }) {
  return (
    <figure className="relative flex h-full flex-col bg-ink p-10 lg:p-12">
      <span
        className="pointer-events-none absolute right-8 top-4 select-none font-display text-[7rem] font-bold leading-none text-brass/15"
        aria-hidden
      >
        &ldquo;
      </span>
      <Stars />
      <blockquote className="relative z-10 mt-6 flex-1 font-display text-xl font-medium leading-[1.65] text-white/90 lg:text-2xl">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-10 flex items-center gap-3 border-t border-white/10 pt-7">
        <Avatar name={testimonial.name} avatar={testimonial.avatar} />
        <p className="font-semibold text-white">{testimonial.name}</p>
      </figcaption>
    </figure>
  )
}

/**
 * A supporting review card.
 *
 * The expanded flag is ordinary component state and the clamp is a class, so
 * each card owns its own toggle and React owns the DOM. An earlier version
 * kept the flag in a ref and applied the clamp by mutating `el.style`, on the
 * reasoning that setState "would re-run effects on sibling cards" — that is
 * not how React works (a child's setState re-renders only that child), and
 * keeping the flag outside React is what let one card's toggle affect another:
 * any unrelated re-render (the avatar's onError, a parent update) rebuilt the
 * JSX while the ref and the hand-written inline styles carried on
 * independently.
 */
function SupportingCard({ testimonial }: { testimonial: TestimonialCard }) {
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const [expanded, setExpanded] = useState(false)
  const [overflowing, setOverflowing] = useState(false)
  const panelId = useId()

  // Measure rather than assume a line height: while the quote is clamped,
  // scrollHeight reports the full content, so it exceeding clientHeight is the
  // overflow signal. The previous version compared against a hand-computed
  // constant (`24 * 1.75 * 5` = 210px, though the comment intended ~122px), so
  // the toggle never appeared on quotes that were genuinely clamped.
  const measure = useCallback(() => {
    const el = quoteRef.current
    if (!el || expanded) return
    setOverflowing(el.scrollHeight > el.clientHeight + 2)
  }, [expanded])

  useEffect(() => {
    measure()
    const el = quoteRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    // The clamp is width-dependent, so a reflow can change the line count.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [measure, testimonial.quote])

  return (
    <figure className="flex h-full flex-col border border-line bg-white p-8">
      <Stars />
      <blockquote
        ref={quoteRef}
        id={panelId}
        className={cn('mt-5 text-sm leading-7 text-ink-2/75', !expanded && LINE_CLAMP)}
      >
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>
      {overflowing || expanded ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="mt-3 self-start text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      ) : null}
      <figcaption className="mt-auto flex items-center gap-3 border-t border-line pt-6">
        <Avatar name={testimonial.name} avatar={testimonial.avatar} />
        <p className="font-semibold text-ink">{testimonial.name}</p>
      </figcaption>
    </figure>
  )
}

/**
 * Testimonial card grid — the Shaker Kitchen page's review cards (Isabel E.,
 * Christian F., James G.). The first review runs full height as the dark
 * feature card; the rest stack beside it. Content comes from the Payload
 * `testimonialCards` group on the service.
 */
export function ServiceTestimonialCardsSection({ items }: { items: TestimonialCard[] }) {
  if (!items.length) return null

  const [primary, ...rest] = items

  if (rest.length === 0) {
    return (
      <Section className="">
        <div className="mx-auto max-w-2xl">
          <PrimaryCard testimonial={primary} />
        </div>
      </Section>
    )
  }

  return (
    <Section className="">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="lg:row-span-2">
            <PrimaryCard testimonial={primary} />
          </div>
          {rest.map((testimonial, index) => (
            // Index-qualified so two reviewers sharing a name cannot collide —
            // duplicate keys make React reuse one instance's state across two
            // cards, which is exactly the "open one, another opens" symptom.
            <SupportingCard key={`${testimonial.name}-${index}`} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </Section>
  )
}
