import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import type { PageLinkListContent } from '@/lib/pageSections'

/** A row of link chips — somewhere to go from a page that is a dead end. */
export function LinkList({ content }: { content: PageLinkListContent }) {
  if (!content.links.length) return null

  return (
    <section className="bg-paper py-14 md:py-16">
      <Container>
        {content.heading ? (
          <h2 className="font-display text-xl font-medium text-ink-2 md:text-2xl">
            {content.heading}
          </h2>
        ) : null}
        <ul className="mt-6 flex flex-wrap gap-3">
          {content.links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group inline-flex items-center gap-2 border border-ink/20 px-5 py-3 text-sm font-medium text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
              >
                {link.label}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
