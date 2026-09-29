'use client'

import Image from '@/components/ui/Image'
import { Star } from 'lucide-react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'

import { Section } from '@/components/ui/Section'

export type TestimonialCard = {
  name: string
  quote: string
  avatar?: string
}

/** The initial line budget before the supporting stack has been measured. */
const INITIAL_LINE_CLAMP = 5
const SUPPORTING_STACK_GAP = 20
const SUPPORTING_TRANSITION_DURATION = '450ms'
const SUPPORTING_TRANSITION_TIMING = 'cubic-bezier(0.22, 1, 0.36, 1)'

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

type SupportingCardMetrics = {
  collapsedCardHeight: number
  fullCardHeight: number
  minCardHeight: number
  fullLines: number
}

type SupportingCardProps = {
  testimonial: TestimonialCard
  expanded: boolean
  onToggle: () => void
  onMeasure: (metrics: SupportingCardMetrics) => void
}

/**
 * A supporting review card. The quote height is capped by the card's current
 * row height, so the card can give or receive lines without changing the
 * height of the testimonial section.
 */
function SupportingCard({ testimonial, expanded, onToggle, onMeasure }: SupportingCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const quoteFrameRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const fullQuoteRef = useRef<HTMLQuoteElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const captionRef = useRef<HTMLElement>(null)
  const [fullLines, setFullLines] = useState(0)
  const [visibleLines, setVisibleLines] = useState(INITIAL_LINE_CLAMP)
  const [quoteMaxHeight, setQuoteMaxHeight] = useState<number | null>(null)
  const panelId = useId()

  const measure = useCallback(() => {
    const card = cardRef.current
    const quoteFrame = quoteFrameRef.current
    const quote = quoteRef.current
    const fullQuote = fullQuoteRef.current
    const caption = captionRef.current

    if (!card || !quoteFrame || !quote || !fullQuote || !caption) return

    const quoteStyle = getComputedStyle(quote)
    const cardStyle = getComputedStyle(card)
    const lineHeight = Number.parseFloat(quoteStyle.lineHeight) || 28
    const fullQuoteHeight = fullQuote.scrollHeight
    const measuredFullLines = Math.max(1, Math.ceil(fullQuoteHeight / lineHeight))
    const cardRect = card.getBoundingClientRect()
    const quoteFrameRect = quoteFrame.getBoundingClientRect()
    const captionHeight = caption.getBoundingClientRect().height
    const buttonStyle = buttonRef.current ? getComputedStyle(buttonRef.current) : null
    const buttonHeight = buttonRef.current
      ? buttonRef.current.getBoundingClientRect().height +
        (Number.parseFloat(buttonStyle?.marginTop || '0') || 0)
      : 0
    const paddingBottom = Number.parseFloat(cardStyle.paddingBottom) || 0
    const quoteStart = quoteFrameRect.top - cardRect.top
    const quoteSpace = Math.max(
      lineHeight,
      cardRect.height - quoteStart - buttonHeight - captionHeight - paddingBottom,
    )
    const availableLines = Math.max(1, Math.floor(quoteSpace / lineHeight))
    const collapsedLines =
      measuredFullLines > INITIAL_LINE_CLAMP ? measuredFullLines - 1 : measuredFullLines
    const nextVisibleLines = Math.min(expanded ? measuredFullLines : collapsedLines, availableLines)

    setFullLines((value) => (value === measuredFullLines ? value : measuredFullLines))
    setVisibleLines((value) => (value === nextVisibleLines ? value : nextVisibleLines))
    setQuoteMaxHeight((value) => {
      const nextHeight = Math.min(fullQuoteHeight, nextVisibleLines * lineHeight)
      return value === nextHeight ? value : nextHeight
    })

    onMeasure({
      collapsedCardHeight:
        quoteStart + collapsedLines * lineHeight + buttonHeight + captionHeight + paddingBottom,
      // This is the card height needed to show the full quote, including its
      // controls and footer. The sibling receives whatever height remains.
      fullCardHeight: quoteStart + fullQuoteHeight + buttonHeight + captionHeight + paddingBottom,
      // Keep at least one line available when the sibling is expanded.
      minCardHeight: quoteStart + lineHeight + buttonHeight + captionHeight + paddingBottom,
      fullLines: measuredFullLines,
    })
  }, [expanded, onMeasure])

  useEffect(() => {
    measure()

    const card = cardRef.current
    const fullQuote = fullQuoteRef.current
    if (!card || typeof ResizeObserver === 'undefined') return

    // Both width changes and the animated row height can change how many
    // lines fit. Observing the card keeps the clamp in sync during the motion.
    const observer = new ResizeObserver(measure)
    observer.observe(card)
    if (fullQuote) observer.observe(fullQuote)
    return () => observer.disconnect()
  }, [measure, testimonial.quote, expanded, fullLines])

  const canToggle = fullLines > INITIAL_LINE_CLAMP

  return (
    <figure
      ref={cardRef}
      className="relative flex min-h-0 h-full flex-col overflow-hidden border border-line bg-white px-6 py-4"
    >
      <Stars />
      <div ref={quoteFrameRef} className="relative mt-4 min-h-0 shrink-0">
        <blockquote
          ref={quoteRef}
          id={panelId}
          className="overflow-hidden text-sm leading-7 text-ink-2/75 transition-[max-height] ease-in-out motion-reduce:transition-none"
          style={{
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: visibleLines,
            maxHeight: quoteMaxHeight ? `${quoteMaxHeight}px` : `${INITIAL_LINE_CLAMP * 28}px`,
            transitionDuration: SUPPORTING_TRANSITION_DURATION,
            transitionTimingFunction: SUPPORTING_TRANSITION_TIMING,
          }}
        >
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        <blockquote
          ref={fullQuoteRef}
          aria-hidden
          className="pointer-events-none invisible absolute inset-x-0 top-0 m-0 text-sm leading-7 text-ink-2/75"
        >
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
      </div>
      {canToggle || expanded ? (
        <button
          ref={buttonRef}
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="mt-2 self-start text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      ) : null}
      <figcaption
        ref={captionRef}
        className="mt-auto flex items-center gap-3 border-t border-line pt-3"
      >
        <Avatar name={testimonial.name} avatar={testimonial.avatar} />
        <p className="font-semibold text-ink">{testimonial.name}</p>
      </figcaption>
    </figure>
  )
}

function SupportingCardsStack({ items }: { items: TestimonialCard[] }) {
  const stackRef = useRef<HTMLDivElement>(null)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [stackHeight, setStackHeight] = useState(0)
  const [desktop, setDesktop] = useState(false)
  const [metrics, setMetrics] = useState<Record<number, SupportingCardMetrics>>({})

  const updateMetrics = useCallback((index: number, next: SupportingCardMetrics) => {
    setMetrics((current) => {
      const previous = current[index]
      if (
        previous &&
        previous.collapsedCardHeight === next.collapsedCardHeight &&
        previous.fullCardHeight === next.fullCardHeight &&
        previous.minCardHeight === next.minCardHeight &&
        previous.fullLines === next.fullLines
      ) {
        return current
      }
      return { ...current, [index]: next }
    })
  }, [])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const media = window.matchMedia('(min-width: 1024px)')
    const update = () => setDesktop(media.matches)
    update()
    media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    const stack = stackRef.current
    if (!stack || typeof ResizeObserver === 'undefined') return

    const update = () => setStackHeight(stack.getBoundingClientRect().height)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(stack)
    return () => observer.disconnect()
  }, [])

  const templateRows = (() => {
    if (!desktop || items.length !== 2 || stackHeight <= SUPPORTING_STACK_GAP) return undefined

    const availableHeight = stackHeight - SUPPORTING_STACK_GAP
    const equalRow = availableHeight / 2
    const first = metrics[0]
    const second = metrics[1]
    if (expandedIndex === null) {
      if (!first || !second) return `${equalRow}px ${equalRow}px`

      const collapsedTotal = first.collapsedCardHeight + second.collapsedCardHeight
      const recipientIndex = first.fullLines >= second.fullLines ? 0 : 1
      const recipient = recipientIndex === 0 ? first : second
      const other = recipientIndex === 0 ? second : first
      const recipientHeight = Math.max(
        recipient.minCardHeight,
        Math.min(
          availableHeight - other.minCardHeight,
          collapsedTotal < availableHeight
            ? availableHeight - other.collapsedCardHeight
            : recipient.collapsedCardHeight,
        ),
      )
      const otherHeight = Math.max(0, availableHeight - recipientHeight)
      return recipientIndex === 0
        ? `${recipientHeight}px ${otherHeight}px`
        : `${otherHeight}px ${recipientHeight}px`
    }

    const active = metrics[expandedIndex]
    const sibling = metrics[expandedIndex === 0 ? 1 : 0]
    if (!active || !sibling) return `${equalRow}px ${equalRow}px`

    // The open card gets the height it needs. If it needs more than the
    // stack can provide, the sibling is reduced to its one-line minimum;
    // otherwise the sibling receives all remaining space.
    const activeHeight = Math.max(
      active.minCardHeight,
      Math.min(active.fullCardHeight, availableHeight - sibling.minCardHeight),
    )
    const siblingHeight = Math.max(0, availableHeight - activeHeight)
    return expandedIndex === 0
      ? `${activeHeight}px ${siblingHeight}px`
      : `${siblingHeight}px ${activeHeight}px`
  })()

  return (
    <div ref={stackRef} className="min-h-0 lg:h-full">
      <div
        className="grid min-h-0 gap-5 lg:h-full lg:grid-rows-2 transition-[grid-template-rows] ease-in-out motion-reduce:transition-none"
        style={{
          gridTemplateRows: templateRows,
          transitionDuration: SUPPORTING_TRANSITION_DURATION,
          transitionTimingFunction: SUPPORTING_TRANSITION_TIMING,
        }}
      >
        {items.map((testimonial, index) => (
          <SupportingCard
            key={`${testimonial.name}-${index}`}
            testimonial={testimonial}
            expanded={expandedIndex === index}
            onToggle={() => setExpandedIndex((current) => (current === index ? null : index))}
            onMeasure={(next) => updateMetrics(index, next)}
          />
        ))}
      </div>
    </div>
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
        <div className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_1fr]">
          <div className="min-h-0">
            <PrimaryCard testimonial={primary} />
          </div>
          <SupportingCardsStack items={rest} />
        </div>
      </div>
    </Section>
  )
}
