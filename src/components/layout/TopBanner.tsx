import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import website from '../../../website.json'
import { Container } from '@/components/ui/Container'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { cn } from '@/lib/utils'

export type TopBannerProps = {
  className?: string

  /** Optional override for the location text */
  location?: string

  /** Optional override for the location link */
  locationHref?: string
}

/**
 * Top utility banner shown above the main header.
 *
 * Desktop / md+:
 *   Location + Email              Phone + Hours
 *
 * Mobile:
 *   Phone                         Hours
 *
 * Content is resolved from Payload Site Settings first,
 * with website.json used as a fallback.
 */
function BannerLink({
  href,
  icon: Icon,
  children,
  emphasize,
}: {
  href: string
  icon: typeof MapPin
  children: ReactNode
  emphasize?: boolean
}) {
  const isExternal =
    href.startsWith('http') || href.startsWith('tel:') || href.startsWith('mailto:')

  const content = (
    <span className="group relative inline-flex min-w-0 items-center gap-1.5 pb-[3px]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-brass" aria-hidden="true" />

      <span
        className={cn(
          'truncate tracking-wide',
          emphasize ? 'font-semibold text-brass' : 'text-white/85',
        )}
      >
        {children}
      </span>

      {/* Liquid underline */}
      <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
        <span className="absolute inset-0 -translate-x-full bg-brass transition-transform duration-300 ease-out group-hover:translate-x-0" />
      </span>
    </span>
  )

  // No destination (e.g. no Maps link and no address link in Site
  // Settings): plain text rather than a link to nowhere.
  if (!href) return <span className="min-w-0 font-medium">{content}</span>

  if (isExternal) {
    return (
      <a
        href={href}
        className="min-w-0 font-medium"
        target={href.startsWith('http') ? '_blank' : undefined}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
      >
        {content}
      </a>
    )
  }

  return (
    <Link href={href} className="min-w-0 font-medium">
      {content}
    </Link>
  )
}

export async function TopBanner({ className, location, locationHref }: TopBannerProps) {
  const siteSettings = await resolveSiteSettings()

  // Respect the CMS toggle.
  if (siteSettings.topBanner?.enabled === false) {
    return null
  }

  // With a database, the region is Site Settings' own field and an empty
  // one hides the location; `website.json` is only the no-database fallback.
  const displayLocation =
    location ||
    (siteSettings.company ? siteSettings.company.serviceRegion : website.header.location) ||
    undefined

  // WordPress links "Silicon Valley" to the same Maps listing as the first
  // office's address, so an empty `mapsUrl` falls back to that address's
  // link rather than to a URL typed into this file (which pointed at a
  // different, San Jose listing).
  const mapsUrl =
    locationHref || siteSettings.company?.mapsUrl || siteSettings.addresses[0]?.link || ''

  const displayEmail = siteSettings.email || siteSettings.company?.email || website.header.email

  const emailLink =
    siteSettings.emailLink || siteSettings.company?.emailLink || `mailto:${displayEmail}`

  const displayPhone =
    siteSettings.phoneCta ||
    siteSettings.company?.phoneCta ||
    siteSettings.phone ||
    siteSettings.company?.phone ||
    website.header.phoneCta

  const phoneClean =
    siteSettings.phoneClean ||
    siteSettings.company?.phoneClean ||
    displayPhone.replace(/[^\d+]/g, '')

  const displayHours = siteSettings.hours || siteSettings.company?.hours || website.header.hours

  return (
    // `aside`, not `div`: this strip sits above the header, outside every
    // other landmark, so without one a screen reader's landmark list skips it.
    <aside
      aria-label="Contact details"
      className={cn('relative z-20 w-full bg-ink text-white/90', className)}
    >
      {/* Thin gold hairline */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-brass/50 to-transparent" />

      <Container>
        {/* ============================================================
            MOBILE
            Phone on the left / Hours on the right
            Visible below md
        ============================================================ */}
        <div className="flex min-h-[38px] items-center justify-between gap-4 py-1.5 text-[11px] sm:text-xs md:hidden">
          {/* Phone */}
          <BannerLink href={`tel:${phoneClean}`} icon={Phone} emphasize>
            <span className="nimbata">{displayPhone}</span>
          </BannerLink>

          {/* Hours */}
          <div className="flex min-w-0 items-center gap-1.5 text-white/70">
            <Clock className="h-3.5 w-3.5 shrink-0 text-brass/90" aria-hidden="true" />

            <span className="truncate tracking-tight">{displayHours}</span>
          </div>
        </div>

        {/* ============================================================
            DESKTOP / TABLET
            Full banner
            Visible at md and above
        ============================================================ */}
        <div className="hidden min-h-[38px] items-center justify-between gap-4 py-1.5 text-[11px] sm:text-xs md:flex">
          {/* Left: Location + Email */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-5">
            {displayLocation ? (
              <>
                {/* Location */}
                <BannerLink href={mapsUrl} icon={MapPin}>
                  {displayLocation}
                </BannerLink>

                {/* Divider */}
                <span className="h-3 w-px rotate-12 bg-brass/25" aria-hidden="true" />
              </>
            ) : null}

            {/* Email */}
            <BannerLink href={emailLink} icon={Mail}>
              {displayEmail}
            </BannerLink>
          </div>

          {/* Right: Phone + Hours */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            {/* Phone */}
            <BannerLink href={`tel:${phoneClean}`} icon={Phone} emphasize>
              <span className="nimbata">{displayPhone}</span>
            </BannerLink>

            {/* Divider */}
            <span
              className="hidden h-3 w-px rotate-12 bg-brass/25 sm:inline-block"
              aria-hidden="true"
            />

            {/* Hours */}
            <div className="hidden items-center gap-1.5 text-white/70 sm:flex">
              <Clock className="h-3.5 w-3.5 shrink-0 text-brass/90" aria-hidden="true" />

              <span className="tracking-tight">{displayHours}</span>
            </div>
          </div>
        </div>
      </Container>
    </aside>
  )
}
