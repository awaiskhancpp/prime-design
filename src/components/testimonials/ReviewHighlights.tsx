import Image from 'next/image'

import { Section } from '@/components/ui/Section'
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

/**
 * Rating badges, the per-platform score/count, and a short wall of review
 * cards.
 *
 * WordPress renders this whole strip from a third-party plugin shortcode
 * (`[brb_collection id="1223"]`), so there is no WordPress content behind it:
 * the badges, scores and profile links are stored on the `review-highlights`
 * block, and the cards are read from the Testimonials collection — the same
 * records the rest of the site uses, not a copy kept on this page.
 */
export function ReviewHighlights({
  content,
  testimonials,
}: {
  content: PageReviewHighlightsContent
  testimonials: CollectionTestimonial[]
}) {
  const cards =
    content.reviewLimit && content.reviewLimit > 0
      ? testimonials.slice(0, content.reviewLimit)
      : testimonials
  const links = content.stats.filter((stat) => stat.url && stat.linkLabel)

  if (!content.badges.length && !content.stats.length && !cards.length) return null

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

      {cards.length || links.length ? (
        <Section className="bg-white pt-0">
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

          {links.length ? (
            <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm">
              {links.map((stat) => (
                <a
                  key={stat.url}
                  href={stat.url}
                  target="_blank"
                  rel="noreferrer"
                  className="border border-line px-5 py-3 font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
                >
                  {stat.linkLabel}
                </a>
              ))}
            </div>
          ) : null}
        </Section>
      ) : null}
    </>
  )
}
