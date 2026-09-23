import { Phone } from 'lucide-react'

import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * LandingHeader — the slim chrome for Google Ads landing pages.
 *
 * Landing pages are intentionally "bare" (no TopBanner, no full SiteHeader,
 * no footer): an ad click lands on a single, focused page and every element on
 * it is there to convert. This header is the one piece of chrome those pages
 * keep, and it is reduced to exactly the two things an ad visitor acts on:
 * call, or get a quote.
 *
 * It overlays the page's dark hero (transparent, white text) the same way the
 * main `SiteHeader` does at rest, and it is deliberately not pinned — the
 * landing page's own estimate band and form sit further down and carry the
 * conversion forward once the hero has scrolled away.
 *
 * The phone number is resolved from Payload Site Settings (`company.phoneCta`
 * / `company.phone`), falling back to `website.json` the same way every other
 * chrome element does via `resolveSiteSettings()`.
 */
export async function LandingHeader() {
  const settings = await resolveSiteSettings()
  const phone = settings.phoneCta || settings.phone
  const phoneClean = settings.phoneClean || phone.replace(/[^\d+]/g, '')

  return (
    <header className="absolute inset-x-0 top-0 z-40 text-white">
      <Container>
        <div className="flex min-h-20 items-center justify-between gap-4">
          {/* Brand — the one element that says who this is. */}
          <BrandMark />

          {/* Actions — the two things the page exists to prompt. */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Phone — the primary action on an ad page, tap-to-call. */}
            <a
              href={`tel:${phoneClean}`}
              className="group hidden items-center gap-2.5 md:flex"
              aria-label={`Call Prime Design & Build at ${phone}`}
            >
              <span
                className="flex h-9 w-9 items-center justify-center  text-brass "
                aria-hidden="true"
              >
                <Phone className="h-4 w-4" />
              </span>
              <span className="text-lg font-semibold tracking-wide transition-colors duration-200 group-hover:text-brass">
                {phone}
              </span>
            </a>

            {/* Mobile — the same call, reduced to the icon. */}
            <a
              href={`tel:${phoneClean}`}
              aria-label={`Call Prime Design & Build at ${phone}`}
              className="flex h-10 w-10 items-center justify-center   text-brass  md:hidden"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
            </a>

            {/* CTA — brass fill, the strongest surface the header owns. */}
            <Button
              href="/contact"
              variant="primary"
              className="border-brass bg-brass text-ink-2 hover:border-brass-deep hover:bg-brass-deep hover:text-white"
            >
              Get a Quote
            </Button>
          </div>
        </div>
      </Container>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 border-b border-white/10"
      />
    </header>
  )
}
