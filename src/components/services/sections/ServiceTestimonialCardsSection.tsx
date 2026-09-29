'use client'

import Image from '@/components/ui/Image'
import { Star } from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from 'react'

import { Section } from '@/components/ui/Section'

export type TestimonialCard = {
  name: string
  quote: string
  avatar?: string
}

/** The initial line budget before the supporting stack has been measured. */
const INITIAL_LINE_CLAMP = 5
const SUPPORTING_STACK_GAP = 20
const SUPPORTING_TRANSITION_MS = 450
const SUPPORTING_TRANSITION_DURATION = `${SUPPORTING_TRANSITION_MS}ms`
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

const PrimaryCard = forwardRef<HTMLElement, { testimonial: TestimonialCard }>(
  function PrimaryCard({ testimonial }, ref) {
    return (
      <figure ref={ref} className="relative flex h-full flex-col bg-ink p-10 lg:p-12">
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
  },
)

/**
 * Holds `element` at the same point on screen while the layout animates
 * around it — the same pattern as `anchor()` in `FaqExplorer`.
 */
function anchor(element: HTMLElement) {
  const top = element.getBoundingClientRect().top
  const started = performance.now()
  const step = () => {
    const delta = element.getBoundingClientRect().top - top
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta)
    // A little past the transition, to catch the final frame.
    if (performance.now() - started < SUPPORTING_TRANSITION_MS + 100) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/**
 * Everything about a card that does not depend on how tall its row is. It is
 * measured once per width, never during the row animation, so the targets
 * below are fixed before the motion starts rather than chased frame by frame.
 */
type SupportingCardMetrics = {
  /** Card height minus the quote: padding, stars, button, footer. */
  chrome: number
  lineHeight: number
  fullQuoteHeight: number
  fullLines: number
}

type SupportingCardProps = {
  testimonial: TestimonialCard
  expanded: boolean
  /**
   * True once the open/close motion has finished. An open card then drops
   * every computed height and sizes to its real content, so a measurement
   * that is off can never leave the end of a review hidden.
   */
  settled: boolean
  /** The number of quote lines this card shows once the motion settles. */
  lines: number
  index: number
  onToggle: (card: HTMLElement, button: HTMLElement) => void
  onMeasure: (index: number, metrics: SupportingCardMetrics) => void
}

/**
 * A supporting review card. Its row height and visible line count are both
 * decided by `SupportingCardsStack`; the card only reports its measurements
 * and animates to the target it is given.
 */
function SupportingCard({
  testimonial,
  expanded,
  settled,
  lines,
  index,
  onToggle,
  onMeasure,
}: SupportingCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const quoteFrameRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const fullQuoteRef = useRef<HTMLQuoteElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const captionRef = useRef<HTMLElement>(null)
  const [metrics, setMetrics] = useState<SupportingCardMetrics | null>(null)
  const panelId = useId()

  const measure = useCallback(() => {
    const card = cardRef.current
    const quoteFrame = quoteFrameRef.current
    const quote = quoteRef.current
    const fullQuote = fullQuoteRef.current
    const caption = captionRef.current

    if (!card || !quoteFrame || !quote || !fullQuote || !caption) return

    const lineHeight = Number.parseFloat(getComputedStyle(quote).lineHeight) || 28
    const fullQuoteHeight = fullQuote.getBoundingClientRect().height
    const button = buttonRef.current
    const buttonHeight = button
      ? button.getBoundingClientRect().height +
        (Number.parseFloat(getComputedStyle(button).marginTop) || 0)
      : 0
    const cardRect = card.getBoundingClientRect()
    const quoteStart = quoteFrame.getBoundingClientRect().top - cardRect.top
    // From the top of the footer to the card's outer edge: the footer, the
    // bottom padding and the bottom border together.
    const footer = cardRect.bottom - caption.getBoundingClientRect().top

    const next: SupportingCardMetrics = {
      chrome: quoteStart + buttonHeight + footer,
      lineHeight,
      fullQuoteHeight,
      fullLines: Math.max(1, Math.round(fullQuoteHeight / lineHeight)),
    }

    setMetrics((current) =>
      current &&
      current.chrome === next.chrome &&
      current.lineHeight === next.lineHeight &&
      current.fullQuoteHeight === next.fullQuoteHeight
        ? current
        : next,
    )
    onMeasure(index, next)
  }, [index, onMeasure])

  useEffect(() => {
    measure()

    const fullQuote = fullQuoteRef.current
    if (!fullQuote || typeof ResizeObserver === 'undefined') return

    // The hidden full-length copy only changes size when the card's width
    // does — not while the row animates — so this never fires mid-motion.
    const observer = new ResizeObserver(measure)
    observer.observe(fullQuote)
    return () => observer.disconnect()
  }, [measure, testimonial.quote])

  const fullLines = metrics?.fullLines ?? 0
  const targetLines = expanded ? Math.max(fullLines, lines) : lines
  const showsAll = metrics !== null && targetLines >= fullLines

  // The ellipsis clamp follows the target, but never ahead of the motion:
  // when the card is gaining lines the clamp lifts at once so the text is
  // revealed as the box opens; when it is losing lines the box closes over
  // the text first and the clamp (and its "…") arrives once it has settled.
  const [settledClamp, setSettledClamp] = useState<number | null>(INITIAL_LINE_CLAMP)
  const nextClamp = showsAll ? null : targetLines
  const growing = nextClamp === null || (settledClamp !== null && nextClamp >= settledClamp)
  const clampLines = growing ? nextClamp : settledClamp
  useEffect(() => {
    const timer = window.setTimeout(() => setSettledClamp(nextClamp), SUPPORTING_TRANSITION_MS)
    return () => window.clearTimeout(timer)
  }, [nextClamp])

  const quoteMaxHeight = metrics
    ? showsAll
      ? metrics.fullQuoteHeight
      : targetLines * metrics.lineHeight
    : INITIAL_LINE_CLAMP * 28

  const canToggle = fullLines > INITIAL_LINE_CLAMP

  return (
    <figure
      ref={cardRef}
      className="relative flex min-h-0 h-full flex-col overflow-hidden border border-line bg-white px-6 py-4"
    >
      <Stars />
      <div ref={quoteFrameRef} className="relative mt-4 min-h-0 shrink overflow-hidden">
        <blockquote
          ref={quoteRef}
          id={panelId}
          className="overflow-hidden text-sm leading-7 text-ink-2/75 transition-[max-height] ease-in-out motion-reduce:transition-none"
          style={{
            display: clampLines === null ? 'block' : '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: clampLines ?? 'none',
            maxHeight: expanded && settled ? 'none' : `${quoteMaxHeight}px`,
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
          onClick={(event) => {
            if (cardRef.current) onToggle(cardRef.current, event.currentTarget)
          }}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="mt-2 shrink-0 self-start text-xs font-semibold uppercase tracking-[0.12em] text-brass-deep transition-colors hover:text-brass"
        >
          {expanded ? 'Read less' : 'Read more'}
        </button>
      ) : null}
      <figcaption
        ref={captionRef}
        className="mt-auto flex shrink-0 items-center gap-3 border-t border-line pt-3"
      >
        <Avatar name={testimonial.name} avatar={testimonial.avatar} />
        <p className="font-semibold text-ink">{testimonial.name}</p>
      </figcaption>
    </figure>
  )
}

/**
 * The primary card's height with its quote at natural size, i.e. the height
 * the row would have if the supporting stack asked for nothing. The quote is
 * `flex-1`, so it is released for one synchronous read and restored before
 * the browser paints.
 */
function naturalPrimaryHeight(card: HTMLElement) {
  const quote = card.querySelector('blockquote')
  const caption = card.querySelector('figcaption')
  if (!quote || !caption) return card.getBoundingClientRect().height

  const previous = quote.style.flex
  quote.style.flex = '0 0 auto'
  const height =
    caption.getBoundingClientRect().bottom -
    card.getBoundingClientRect().top +
    (Number.parseFloat(getComputedStyle(card).paddingBottom) || 0)
  quote.style.flex = previous
  return height
}

function SupportingCardsStack({
  items,
  primaryRef,
}: {
  items: TestimonialCard[]
  primaryRef: RefObject<HTMLElement | null>
}) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [settled, setSettled] = useState(true)
  const [baseHeight, setBaseHeight] = useState(0)
  const [desktop, setDesktop] = useState(false)
  const [metrics, setMetrics] = useState<Record<number, SupportingCardMetrics>>({})

  const updateMetrics = useCallback((index: number, next: SupportingCardMetrics) => {
    setMetrics((current) => {
      const previous = current[index]
      if (
        previous &&
        previous.chrome === next.chrome &&
        previous.lineHeight === next.lineHeight &&
        previous.fullQuoteHeight === next.fullQuoteHeight
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

  // The stack is sized from the primary card's *natural* height rather than
  // from the row, because the row grows when an open review needs more room
  // than the primary card offers — measuring the row would feed that back.
  useEffect(() => {
    const primary = primaryRef.current
    if (!primary || typeof ResizeObserver === 'undefined') return

    const update = () => setBaseHeight(naturalPrimaryHeight(primary))
    update()
    const observer = new ResizeObserver(update)
    observer.observe(primary)
    return () => observer.disconnect()
  }, [primaryRef])

  // Once the motion has run its course, hand the open card back to its real
  // content height (see `settled` on SupportingCard).
  useEffect(() => {
    if (settled) return
    const timer = window.setTimeout(() => setSettled(true), SUPPORTING_TRANSITION_MS + 50)
    return () => window.clearTimeout(timer)
  }, [settled, expandedIndex])

  const toggle = (index: number, card: HTMLElement, button: HTMLElement) => {
    const opening = expandedIndex !== index
    // Opening: the review's first line stays where the reader is looking
    // while it grows downward. Closing: the button stays under the pointer
    // instead of being left above the viewport.
    anchor(opening ? card : button)
    // Two steps, so the motion always starts from pixel values: first leave
    // the settled (content-sized) state for the computed heights of the
    // current state, then — once that has been painted — move to the target.
    // CSS cannot animate from `auto` / `none`.
    setSettled(false)
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setExpandedIndex(opening ? index : null)),
    )
  }

  const collapsedLines = (m: SupportingCardMetrics) =>
    m.fullLines > INITIAL_LINE_CLAMP ? m.fullLines - 1 : m.fullLines
  const cardHeight = (m: SupportingCardMetrics, lines: number) => m.chrome + lines * m.lineHeight
  const fullCardHeight = (m: SupportingCardMetrics) => m.chrome + m.fullQuoteHeight

  const rows = (() => {
    if (!desktop || items.length !== 2 || baseHeight <= SUPPORTING_STACK_GAP) return null

    const availableHeight = baseHeight - SUPPORTING_STACK_GAP
    const first = metrics[0]
    const second = metrics[1]
    if (!first || !second) return null

    if (expandedIndex === null) {
      const firstCollapsed = cardHeight(first, collapsedLines(first))
      const secondCollapsed = cardHeight(second, collapsedLines(second))
      const recipientIndex = first.fullLines >= second.fullLines ? 0 : 1
      const [recipient, recipientCollapsed, other, otherCollapsed] =
        recipientIndex === 0
          ? [first, firstCollapsed, second, secondCollapsed]
          : [second, secondCollapsed, first, firstCollapsed]
      const recipientHeight = Math.max(
        cardHeight(recipient, 1),
        Math.min(
          availableHeight - cardHeight(other, 1),
          firstCollapsed + secondCollapsed < availableHeight
            ? availableHeight - otherCollapsed
            : recipientCollapsed,
        ),
      )
      const otherHeight = Math.max(0, availableHeight - recipientHeight)
      return recipientIndex === 0 ? [recipientHeight, otherHeight] : [otherHeight, recipientHeight]
    }

    // The open card always gets the full height of its quote, so nothing is
    // left behind an ellipsis. The sibling takes whatever the primary card's
    // height leaves, down to its one-line minimum; if the open review needs
    // more than that, the whole row grows to fit it.
    const active = metrics[expandedIndex]
    const sibling = metrics[expandedIndex === 0 ? 1 : 0]
    const activeHeight = fullCardHeight(active)
    const siblingHeight = Math.max(cardHeight(sibling, 1), availableHeight - activeHeight)
    return expandedIndex === 0 ? [activeHeight, siblingHeight] : [siblingHeight, activeHeight]
  })()

  const linesFor = (index: number) => {
    const m = metrics[index]
    if (!m) return INITIAL_LINE_CLAMP
    if (expandedIndex === index) return m.fullLines
    if (!rows) return Math.min(m.fullLines, INITIAL_LINE_CLAMP)
    const fit = Math.floor((rows[index] - m.chrome) / m.lineHeight + 0.01)
    return Math.max(1, Math.min(m.fullLines, fit))
  }

  const contentSized = settled && expandedIndex !== null
  const stackHeight = rows && !contentSized ? rows[0] + rows[1] + SUPPORTING_STACK_GAP : undefined
  // Settled open: the open card's row is `auto` (its real content), the
  // sibling keeps its computed height, and any space left beside the primary
  // card is absorbed by the auto row.
  const templateRows = rows
    ? contentSized
      ? expandedIndex === 0
        ? `auto ${rows[1]}px`
        : `${rows[0]}px auto`
      : `${rows[0]}px ${rows[1]}px`
    : undefined

  return (
    <div
      className="min-h-0 transition-[height] ease-in-out motion-reduce:transition-none lg:h-full"
      style={{
        height: stackHeight,
        transitionDuration: SUPPORTING_TRANSITION_DURATION,
        transitionTimingFunction: SUPPORTING_TRANSITION_TIMING,
      }}
    >
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
            settled={settled}
            lines={linesFor(index)}
            onToggle={(card, button) => toggle(index, card, button)}
            index={index}
            onMeasure={updateMetrics}
          />
        ))}
      </div>
    </div>
  )
}

function TestimonialCardsGrid({
  primary,
  rest,
}: {
  primary: TestimonialCard
  rest: TestimonialCard[]
}) {
  const primaryRef = useRef<HTMLElement>(null)

  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_1fr]">
      <div className="min-h-0">
        <PrimaryCard ref={primaryRef} testimonial={primary} />
      </div>
      <SupportingCardsStack items={rest} primaryRef={primaryRef} />
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
        <TestimonialCardsGrid primary={primary} rest={rest} />
      </div>
    </Section>
  )
}
