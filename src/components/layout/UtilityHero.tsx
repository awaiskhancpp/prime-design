import type { ReactNode } from 'react'

import { Container } from '@/components/ui/Container'

/**
 * The hero for the site's utility pages — 404 and Thank You.
 *
 * Not `PageHero`. That component is built for marketing pages: a full-bleed
 * photograph behind white copy, min-height of the viewport. On a utility page
 * a stock remodel photo reads as a real page and competes with the one thing
 * the visitor needs, which is the message and a way onward. This is the
 * opposite — white, quiet, and typographic, with a single oversized display
 * element carrying the page.
 *
 * `display` is that element: the 404 numeral, or the confirmation mark on the
 * thank-you page. It is centred above the copy and sized by the caller, since
 * a numeral and an icon want very different scales.
 */
export function UtilityHero({
  eyebrow,
  display,
  title,
  description,
  children,
}: {
  eyebrow?: string
  /** The oversized graphic element — sized by the caller. */
  display?: ReactNode
  title: string
  description?: ReactNode
  /** Actions, rendered centred under the copy. */
  children?: ReactNode
}) {
  return (
    <section className="bg-white pb-16 pt-20 md:pb-20 md:pt-28">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          {display}

          {eyebrow ? (
            <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.28em] text-brass">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="mt-4 font-display text-3xl font-medium leading-[1.15] tracking-tight text-ink-2 md:text-5xl">
            {title}
          </h1>

          {description ? (
            <div className="mt-5 max-w-xl text-base leading-7 text-ink-2/65 md:text-lg md:leading-8">
              {description}
            </div>
          ) : null}

          {children ? (
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
