import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { BrandMark } from '@/components/layout/BrandMark'
import { UtilityHero } from '@/components/layout/UtilityHero'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { SiteSearchForm } from '@/components/search/SiteSearchForm'

const sections = [
  { label: 'Services', href: '/services', detail: 'Kitchen, bath, ADU, whole-home' },
  { label: 'Our Projects', href: '/our-projects', detail: 'Completed remodels across the valley' },
  { label: 'Gallery', href: '/gallery', detail: 'Photography from recent builds' },
  { label: 'Blog', href: '/blog', detail: 'Advice and project stories' },
  { label: 'FAQs', href: '/faq', detail: 'Process, timelines and financing' },
  { label: 'Contact', href: '/contact', detail: 'Talk to the team' },
]

/**
 * 404.
 *
 * Next renders this page bare — the template's header, CTA band and footer do
 * not wrap it — so the brand mark at the top is deliberate: without it the
 * page has no logo and no way home other than the buttons.
 *
 * The numeral is the design. It is set solid in the display face rather than
 * tinted or outlined, with `leading-[0.75]` and tight tracking so the three
 * figures read as one mark, and a brass rule beneath tying it to the rest of
 * the site's accents.
 */
export function NotFoundPage() {
  return (
    <main data-light-chrome className="min-h-screen bg-white">
      {/* <Container className="pt-8 md:pt-10">
        <BrandMark />
      </Container> */}

      <UtilityHero
        eyebrow="Error 404"
        display={
          <>
            <p
              className="font-display font-medium leading-[0.75] tracking-tighter text-ink-2 text-[7rem] sm:text-[10rem] md:text-[13rem] lg:text-[15rem]"
              aria-hidden
            >
              404
            </p>
            <span className="mt-8 block h-1 w-16 bg-brass" aria-hidden />
          </>
        }
        title="This page took a wrong turn"
        description="The page you’re looking for doesn’t exist, or it may have moved. Search below, or pick up from one of the sections."
      >
        <Button href="/" variant="primary" size="lg">
          Back to homepage
        </Button>
        <Button href="/contact" variant="outline" size="lg">
          Talk to an expert
        </Button>
      </UtilityHero>

      <section className="border-t border-line bg-white py-14 md:py-16">
        <Container>
          <div className="mx-auto max-w-xl">
            <SiteSearchForm />
          </div>

          {/* Hairline grid: one rule between cells rather than boxes, so the
              list stays quiet against all the white around it. */}
          <ul className="mx-auto mt-14 grid max-w-4xl border-t border-line sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <li key={section.href} className="border-b border-line">
                <Link
                  href={section.href}
                  className="group flex h-full items-start justify-between gap-4 py-5 pr-1 transition-colors sm:px-5"
                >
                  <span className="min-w-0">
                    <span className="block font-display text-base font-medium text-ink-2 transition-colors group-hover:text-brass-deep">
                      {section.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-ink-2/55">
                      {section.detail}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-ink-2/25 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brass"
                    aria-hidden
                  />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </main>
  )
}
