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
        <div className=" flex flex-wrap items-center justify-between gap-5 py-9">
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
            className="bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-paper items-center flex gap-2"
          >
            Get started <ArrowRight />
          </Link>
        </div>
      </Container>
    </section>
  )
}
