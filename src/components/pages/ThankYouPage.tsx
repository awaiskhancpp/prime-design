import Link from 'next/link'
import { ArrowRight, Check, CalendarDays, Phone } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { UtilityHero } from '@/components/layout/UtilityHero'
import { Button } from '@/components/ui/Button'
import { resolveSiteSettings } from '@/lib/siteSettings'

const nextSteps = [
  {
    title: 'We read your message',
    detail: 'A member of the team reviews what you sent and the work you have in mind.',
  },
  {
    title: 'We get in touch',
    detail: 'Usually within one business day, by phone or email — whichever you gave us.',
  },
  {
    title: 'We book your consultation',
    detail: 'A free, no-obligation walkthrough of the space, your budget and your timeline.',
  },
]

const meanwhile = [
  { label: 'Browse our projects', href: '/our-projects' },
  { label: 'See the gallery', href: '/gallery' },
  { label: 'Read the FAQs', href: '/faq' },
  { label: 'Financing options', href: '/finance' },
]

/**
 * `/thank-you` — the page a submitted enquiry lands on.
 *
 * WordPress has this page in its export but with no content at all
 * (`sourceContentLength: 0`), and there is no Payload record for it either,
 * so `resolvePageBySlug` fell through to the stub in `wordpressPages.ts` and
 * `PayloadPage` rendered a header and footer around nothing. This gives it a
 * real page: confirmation, what happens next, and somewhere to go.
 *
 * The phone number comes from Site Settings so it stays in step with the
 * header and footer rather than being a second hardcoded copy.
 */
export async function ThankYouPage() {
  const settings = await resolveSiteSettings()
  const phone = settings.phone

  return (
    <div className="min-h-screen bg-white">
      <UtilityHero
        eyebrow="Message received"
        display={
          <span
            className="flex h-20 w-20 items-center justify-center rounded-full border border-brass text-brass md:h-24 md:w-24"
            aria-hidden
          >
            <Check className="h-9 w-9 md:h-11 md:w-11" strokeWidth={1.5} />
          </span>
        }
        title="Thank you — we’ll be in touch shortly"
        description="Your enquiry is with our team. We answer every message personally, usually within one business day."
      >
        <Button href="/contact" variant="primary" size="lg">
          <CalendarDays className="h-4 w-4" aria-hidden />
          Book a free consultation
        </Button>
        {phone ? (
          <Button href={`tel:${phone.replace(/[^\d+]/g, '')}`} variant="outline" size="lg">
            <Phone className="h-4 w-4" aria-hidden />
            {phone}
          </Button>
        ) : null}
      </UtilityHero>

      <section className="border-t border-line py-16 md:py-20">
        <Container>
          <h2 className="font-display text-2xl font-medium text-ink-2 md:text-3xl">
            What happens next
          </h2>

          <ol className="mt-10 grid gap-8 sm:grid-cols-3">
            {nextSteps.map((step, index) => (
              <li key={step.title} className="border-t border-line pt-6">
                <span className="font-display text-sm font-semibold text-brass">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 font-display text-lg font-medium text-ink-2">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-ink-2/70">{step.detail}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-paper py-14 md:py-16">
        <Container>
          <h2 className="font-display text-xl font-medium text-ink-2 md:text-2xl">
            In the meantime
          </h2>
          <ul className="mt-6 flex flex-wrap gap-3">
            {meanwhile.map((link) => (
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
    </div>
  )
}
