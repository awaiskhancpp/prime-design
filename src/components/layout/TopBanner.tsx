import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import website from '../../../website.json'
import { Container } from '@/components/ui/Container'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { cn } from '@/lib/utils'

// The one location this business is actually listed under on Google Maps.
// Used only when the CMS field is empty.
const FALLBACK_MAPS_URL =
  'https://www.google.com/maps/place/Prime+kitchens+remodeling+San+Jose/@37.3684697,-121.9172543,17z/data=!3m1!4b1!4m6!3m5!1s0x808fcb92f07b591b:0xa445b2611304f808!8m2!3d37.3684697!4d-121.9146794!16s%2Fg%2F11s6b2qvct?shorturl=1'

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

  const displayLocation = location || siteSettings.company?.serviceRegion || website.header.location

  const mapsUrl = locationHref || siteSettings.company?.mapsUrl || FALLBACK_MAPS_URL

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
    <div className={cn('relative z-20 w-full bg-ink text-white/90', className)}>
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
            {displayPhone}
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
            {/* Location */}
            <BannerLink href={mapsUrl} icon={MapPin}>
              {displayLocation}
            </BannerLink>

            {/* Divider */}
            <span className="h-3 w-px rotate-12 bg-brass/25" aria-hidden="true" />

            {/* Email */}
            <BannerLink href={emailLink} icon={Mail}>
              {displayEmail}
            </BannerLink>
          </div>

          {/* Right: Phone + Hours */}
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            {/* Phone */}
            <BannerLink href={`tel:${phoneClean}`} icon={Phone} emphasize>
              {displayPhone}
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
    </div>
  )
}
