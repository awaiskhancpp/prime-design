import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { Clock, Mail, MapPin, Phone } from 'lucide-react'

import website from '../../../website.json'
import { BrandMark } from './BrandMark'
import { Container } from '@/components/ui/Container'
import { WAVE_BACKGROUND } from '@/lib/assets'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * Footer link: the label carries a brass underline that sweeps in from the
 * left on hover — the same quiet motion the `line` Button variant uses, so
 * the footer's links feel like the rest of the site's links.
 */
function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex w-fit text-sm text-white/65 transition-colors hover:text-white"
    >
      <span className="relative">
        {children}
        <span
          className="absolute inset-x-0 -bottom-1 h-px origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100"
          aria-hidden="true"
        />
      </span>
    </Link>
  )
}

/** Column label plus a short brass rule, so the four columns read as a set. */
function ColumnHeading({ children }: { children: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brass">
        {children}
      </p>
      <span className="mt-4 block h-px w-8 bg-brass/40" aria-hidden="true" />
    </div>
  )
}

/**
 * Site footer. WordPress keeps the footer inside the same wave-painted band
 * as the CTA above it (footer template id 78), so the wave is continued and
 * faded out here instead of switching to a second flat navy block.
 */
export async function SiteFooter() {
  const siteSettings = await resolveSiteSettings()

  return (
    <footer className="relative isolate overflow-hidden bg-ink text-white">
      <Image
        src={WAVE_BACKGROUND}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="scale-y-[-1] object-cover object-bottom opacity-45"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink"
        aria-hidden="true"
      />

      <span
        className="relative block h-px w-full bg-gradient-to-r from-transparent via-brass/40 to-transparent"
        aria-hidden="true"
      />

      <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.25fr_0.75fr_0.85fr_1.15fr] lg:gap-10 lg:py-20">
        <div>
          <BrandMark />
          <p className="mt-6 max-w-xs text-sm leading-7 text-white/60">
            Thoughtful design and careful building for homes across Silicon Valley.
          </p>
          <p className="mt-6 inline-flex border border-brass/40 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-brass">
            {siteSettings.license}
          </p>
        </div>

        <div>
          <ColumnHeading>Quick links</ColumnHeading>
          <nav className="mt-5 grid gap-3.5" aria-label="Footer navigation">
            {website.footer.quickLinks.slice(0, 5).map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </nav>
        </div>

        <div>
          <ColumnHeading>Services</ColumnHeading>
          <nav className="mt-5 grid gap-3.5" aria-label="Footer services">
            {website.footer.serviceLinks.map((item) => (
              <FooterLink key={item.label} href={item.href}>
                {item.label}
              </FooterLink>
            ))}
          </nav>
        </div>

        <div>
          <ColumnHeading>Contact</ColumnHeading>
          <address className="mt-5 grid gap-4 text-sm not-italic leading-6 text-white/65">
            <a
              href={`tel:${siteSettings.phoneClean}`}
              className="flex items-start gap-3 transition-colors hover:text-white"
            >
              <Phone className="mt-1 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
              <span>{siteSettings.phone}</span>
            </a>
            <a
              href={siteSettings.emailLink}
              className="flex items-start gap-3 break-all transition-colors hover:text-white"
            >
              <Mail className="mt-1 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
              <span>{siteSettings.email}</span>
            </a>
            {siteSettings.hours ? (
              <p className="flex items-start gap-3 text-white/50">
                <Clock className="mt-1 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                <span>{siteSettings.hours}</span>
              </p>
            ) : null}
            {siteSettings.addresses.map((item) => (
              <p key={item.address} className="flex items-start gap-3">
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-brass" aria-hidden="true" />
                {item.link ? (
                  <a href={item.link} className="transition-colors hover:text-white">
                    {item.address}
                  </a>
                ) : (
                  <span>{item.address}</span>
                )}
              </p>
            ))}
          </address>
        </div>
      </Container>

      <Container className="relative">
        <div className="flex flex-col gap-3 border-t border-white/10 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>{website.footer.copyright}</p>
          <Link
            href={website.footer.privacyPolicyHref}
            className="w-fit transition-colors hover:text-white"
          >
            Privacy Policy
          </Link>
        </div>
      </Container>
    </footer>
  )
}
