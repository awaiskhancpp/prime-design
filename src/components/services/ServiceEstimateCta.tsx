import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'

import { Container } from '../ui/Container'

/**
 * The free-estimate band.
 *
 * `body` is the rich-text description and wins when present; `description`
 * remains for callers that still pass a plain string. The copy carries links
 * ("Contact us here", the phone number), which is why it is rich text — the
 * band's own "Get started" button is separate from those.
 */
export function ServiceEstimateCta({
  heading,
  description,
  body,
}: {
  heading?: string
  description?: string
  body?: ReactNode
}) {
  return (
    <section className="bg-brass">
      <Container>
        {/* Centred while the row is stacked, and only then.
            Below `sm` the heading, the copy and the button sit on separate
            lines with the button's full width to themselves, and text ragged
            against the left of a band with nothing beside it reads as a
            column that lost its partner. Once the row is side by side at
            `sm` and up, the copy goes back to the left and keeps its
            relationship with the button on the right. */}
        <div className="flex flex-col items-center gap-5 py-9 text-center sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:text-left">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white">{heading}</h2>
            {body ? (
              // `[&_a]` rather than styling the links at the source: the copy
              // is CMS-authored, so the anchors arrive unstyled.
              <div className="mt-2 text-sm text-white/85 [&_a]:font-semibold [&_a]:text-white [&_a]:underline [&_a]:underline-offset-2 [&_a:hover]:text-ink [&_p]:mt-0">
                {body}
              </div>
            ) : description ? (
              <p className="mt-2 text-sm text-white/85 ">{description}</p>
            ) : null}
          </div>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-paper"
          >
            Get started <ArrowRight />
          </Link>
        </div>
      </Container>
    </section>
  )
}
