'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import type { PageReviewHighlightsContent } from '@/lib/pageSections'
import type { CollectionTestimonial } from '@/lib/testimonialsCollection.server'

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const ALL = '__all__'

/** How many more cards each press of "Load more" reveals. */
const DEFAULT_PAGE_SIZE = 20

/**
 * Rating badges, the per-platform score/count, and the review wall.
 *
 * WordPress renders this whole strip from a third-party plugin shortcode
 * (`[brb_collection id="1223"]`), so there is no WordPress content behind it:
 * the badges, scores and profile links are stored on the `review-highlights`
 * block, and the cards are read from the Testimonials collection — the same
 * records the rest of the site uses, not a copy kept on this page.
 *
 * The wall pages in batches rather than showing everything at once: the
 * collection holds well over a hundred reviews, and rendering them all would
 * be a wall of text nobody scrolls. `reviewLimit` on the block sets the batch
 * size.
 *
 * Source values are compared lowercased — the collection has both "google"
 * and "Google", and both "yelp" and "Yelp".
 */
export function ReviewHighlights({
  content,
  testimonials,
}: {
  content: PageReviewHighlightsContent
  testimonials: CollectionTestimonial[]
}) {
  const pageSize =
    content.reviewLimit && content.reviewLimit > 0 ? content.reviewLimit : DEFAULT_PAGE_SIZE

  const [tab, setTab] = useState<string>(ALL)
  const [shown, setShown] = useState(pageSize)

  /** Tabs are built from the reviews actually present, not a fixed list. */
  const tabs = useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>()
    for (const review of testimonials) {
      const key = (review.source || '').trim().toLowerCase()
      if (!key) continue
      const existing = counts.get(key)
      if (existing) existing.count += 1
      // First spelling encountered supplies the label, title-cased.
      else counts.set(key, { label: key[0].toUpperCase() + key.slice(1), count: 1 })
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].count - a[1].count)
      .map(([key, value]) => ({ key, ...value }))
  }, [testimonials])

  const filtered = useMemo(
    () =>
      tab === ALL
        ? testimonials
        : testimonials.filter((review) => (review.source || '').trim().toLowerCase() === tab),
    [testimonials, tab],
  )

  const cards = filtered.slice(0, shown)
  const remaining = filtered.length - cards.length

  /** Switching tab restarts the paging, so a new tab never opens part-way. */
  const selectTab = (key: string) => {
    setTab(key)
    setShown(pageSize)
  }

  if (!content.badges.length && !content.stats.length && !testimonials.length) return null

  return (
    <>
      <Section className="bg-white pt-0">
        {content.badges.length ? (
          <div className="flex flex-wrap items-center justify-center gap-8 border-y border-line py-8">
            {content.badges.map((badge) => (
              <Image
                key={badge.image}
                src={badge.image}
                alt={badge.alt}
                width={145}
                height={62}
                className="h-auto w-auto max-w-36 object-contain"
              />
            ))}
          </div>
        ) : null}
        {content.stats.length ? (
          <div className="mt-10 grid gap-4 text-center text-sm text-ink-2/70 sm:grid-cols-2">
            {content.stats.map((stat) => (
              <p key={stat.label ?? stat.url}>
                {stat.rating ? (
                  <strong className="block font-display text-4xl text-brass">
                    {stat.rating}★{stat.count ? ` (${stat.count})` : null}
                  </strong>
                ) : null}
                {stat.label}
              </p>
            ))}
          </div>
        ) : null}
      </Section>

      {testimonials.length ? (
        <Section className="bg-white pt-0">
          {/* Platform tabs. Only worth showing when more than one platform is
              represented — with a single source, "All" and that source are
              the same list. */}
          {tabs.length > 1 ? (
            <div
              role="tablist"
              aria-label="Filter reviews by platform"
              className="mb-10 flex flex-wrap items-center justify-center gap-2"
            >
              <TabButton
                label="All reviews"
                count={testimonials.length}
                active={tab === ALL}
                onClick={() => selectTab(ALL)}
              />
              {tabs.map((entry) => (
                <TabButton
                  key={entry.key}
                  label={`${entry.label} reviews`}
                  count={entry.count}
                  active={tab === entry.key}
                  onClick={() => selectTab(entry.key)}
                />
              ))}
            </div>
          ) : null}

          {cards.length ? (
            <div className="columns-1 md:columns-2 md:gap-4">
              {cards.map((review) => (
                <article
                  key={review.id}
                  className="mb-4 inline-block w-full break-inside-avoid border border-line bg-paper p-5 sm:p-6"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center bg-paper-2 text-xs font-semibold text-ink-2">
                      {initials(review.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-ink-2">{review.name}</span>
                      {review.source || review.timeAgo ? (
                        <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-ink-2/50">
                          {[review.source, review.timeAgo].filter(Boolean).join(' · ')}
                        </span>
                      ) : null}
                    </span>
                    {review.rating ? (
                      <span
                        className="shrink-0 text-sm tracking-[0.08em] text-brass"
                        aria-label={`${review.rating} out of 5 stars`}
                      >
                        {'★'.repeat(Math.round(review.rating))}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-6 text-base leading-7 text-ink-2/75">{review.quote}</p>
                </article>
              ))}
            </div>
          ) : null}

          <div className="mt-10 flex flex-col items-center gap-3">
            <p className="text-xs uppercase tracking-[0.14em] text-ink-2/45" aria-live="polite">
              Showing {cards.length} of {filtered.length}
            </p>
            {remaining > 0 ? (
              <button
                type="button"
                onClick={() => setShown((current) => current + pageSize)}
                className="border border-ink/25 px-6 py-3 text-sm font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep focus-visible:outline-2 focus-visible:outline-brass"
              >
                Load more reviews
              </button>
            ) : null}
          </div>
        </Section>
      ) : null}
    </>
  )
}

function TabButton({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        // `font-semibold` on every state: a weight change would resize the
        // tab and shuffle the row as the selection moves.
        'inline-flex items-center gap-2 border px-5 py-2.5 text-sm font-semibold transition-colors duration-300',
        active
          ? 'border-brass bg-brass text-ink'
          : 'border-line text-ink-2/70 hover:border-brass hover:text-brass-deep',
      )}
    >
      {label}
      <span className={cn('text-xs tabular-nums', active ? 'text-ink/60' : 'text-ink-2/40')}>
        {count}
      </span>
    </button>
  )
}
