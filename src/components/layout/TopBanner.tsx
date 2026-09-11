import { Clock, Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'

import website from '../../../website.json'
import { Container } from '@/components/ui/Container'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { cn } from '@/lib/utils'

export type TopBannerProps = {
  className?: string
  /** Tone variant: 'dark' (luxury deep ink) or 'transparent' for overlay */
  tone?: 'dark' | 'transparent' | 'light'
  /** Optional override for the location text (defaults to CMS or website.json "Silicon Valley") */
  location?: string
  /** Optional link for location (defaults to /services) */
  locationHref?: string
}

/**
 * Top utility banner displayed directly above the main navigation header.
 * Showcases:
 *  - Left: Service region (Silicon Valley) & direct office email
 *  - Right: Quick click-to-call phone & live office hours
 *
 * Designed with a refined luxury aesthetic matching Prime Design & Build's brand,
 * featuring gold/brass accents, interactive hover states, and fully responsive layout.
 */
export async function TopBanner({
  className,
  tone = 'dark',
  location,
  locationHref = '/services',
}: TopBannerProps) {
  const siteSettings = await resolveSiteSettings()

  // Resolved values with fallbacks to website.json header configuration
  const displayLocation = location || website.header.location
  const displayEmail = siteSettings.email || website.header.email
  const emailLink = siteSettings.emailLink || `mailto:${displayEmail}`
  const displayPhone = siteSettings.phoneCta || siteSettings.phone || website.header.phoneCta
  const phoneClean = siteSettings.phoneClean || displayPhone.replace(/[^\d+]/g, '')
  const displayHours = siteSettings.hours || website.header.hours

  const toneStyles = {
    dark: 'bg-[#0B111E]/95 backdrop-blur-md text-white/90 border-b border-white/[0.08]',
    transparent: 'bg-black/30 backdrop-blur-md text-white/90 border-b border-white/10',
    light: 'bg-paper text-ink border-b border-line',
  }

  return (
    <div
      className={cn(
        'relative z-20 w-full transition-colors duration-200',
        toneStyles[tone],
        className,
      )}
    >
      {/* Top subtle golden hairline accent highlight */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-brass/50 to-transparent" />

      <Container>
        <div className="flex min-h-[38px] items-center justify-between gap-4 py-1.5 text-[11px] sm:text-xs">
          {/* Left Side: Location & Email */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Service Location */}
            <Link
              href={locationHref}
              className="group flex items-center gap-1.5 font-medium tracking-wide transition-colors duration-150 hover:text-brass"
            >
              <span className="flex h-4 w-4 items-center justify-center text-brass transition-transform duration-200 group-hover:scale-110">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="text-white/85 group-hover:text-brass">{displayLocation}</span>
            </Link>

            {/* Micro Divider */}
            <span className="h-3 w-px bg-white/20" aria-hidden="true" />

            {/* Email */}
            <a
              href={emailLink}
              className="group flex items-center gap-1.5 font-medium tracking-wide transition-colors duration-150 hover:text-brass"
            >
              <span className="flex h-4 w-4 items-center justify-center text-brass transition-transform duration-200 group-hover:scale-110">
                <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="truncate text-white/85 group-hover:text-brass">{displayEmail}</span>
            </a>
          </div>

          {/* Right Side: Phone & Office Hours */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Direct Phone */}
            <a
              href={`tel:${phoneClean}`}
              className="group flex items-center gap-1.5 font-medium tracking-wide transition-colors duration-150 hover:text-brass"
            >
              <span className="flex h-4 w-4 items-center justify-center text-brass transition-transform duration-200 group-hover:scale-110">
                <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="font-semibold text-brass transition-colors group-hover:text-white">
                {displayPhone}
              </span>
            </a>

            {/* Micro Divider (Hidden on small screens if space is tight) */}
            <span className="hidden h-3 w-px bg-white/20 sm:inline-block" aria-hidden="true" />

            {/* Office Hours */}
            <div className="hidden items-center gap-1.5 text-white/70 sm:flex">
              <span className="flex h-4 w-4 items-center justify-center text-brass/90">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
              <span className="tracking-tight">{displayHours}</span>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
