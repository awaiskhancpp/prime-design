import { Phone } from 'lucide-react'

import { BrandMark } from '@/components/layout/BrandMark'
import { Container } from '@/components/ui/Container'

/**
 * The persistent top bar for service-location (city) pages.
 *
 * These are single-purpose landing pages with no global `SiteHeader` — the
 * hero used to render this as a plain flex row that scrolled away with the
 * rest of the page. Pulled into its own component and pinned to the top of
 * the viewport instead, since a city page is exactly the kind of page where
 * "the phone number is always one glance away" matters more than it does on
 * the rest of the site.
 *
 * Two `.nimbata` spans (one per breakpoint, only one ever visible) rather
 * than a single responsive one — the same pattern `TopBanner` and
 * `SiteHeader` already use, because the call-tracking script that swaps this
 * text in looks for the class, not for visibility.
 */
export function ServiceLocationHeader({ phone, phoneHref }: { phone: string; phoneHref: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-white/90 backdrop-blur-md">
      <Container className="flex items-center justify-between gap-4 py-3 sm:py-4">
        <BrandMark forceReload />

        <a
          href={phoneHref}
          className="group flex items-center gap-3"
          aria-label={`Call us at ${phone}`}
        >
          <span className="hidden text-right sm:block">
            <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-brass-deep">
              Ready to discuss your needs?
            </span>
            <span className="nimbata block font-display text-lg font-medium leading-tight text-ink transition-colors group-hover:text-brass-deep">
              {phone}
            </span>
          </span>

          {/* Compact, phone-number-only readout below `sm` — the two-line
              label above doesn't have room next to the logo on a phone. */}
          <span className="nimbata font-display text-base font-medium leading-none text-ink transition-colors group-hover:text-brass-deep sm:hidden">
            {phone}
          </span>

          <span className="flex h-11 w-11 shrink-0 items-center justify-center  bg-brass text-white shadow-sm shadow-brass/30 transition-transform duration-200 group-hover:scale-105 group-hover:bg-brass-deep">
            <Phone className="h-5 w-5" strokeWidth={2.25} aria-hidden />
          </span>
        </a>
      </Container>
    </header>
  )
}
