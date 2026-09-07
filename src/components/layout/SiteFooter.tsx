import Link from 'next/link'

import website from '../../../website.json'
import { Container } from '@/components/ui/Container'

import { BrandMark } from './BrandMark'
import { resolveSiteSettings } from '@/lib/siteSettings'

export async function SiteFooter() {
  const siteSettings = await resolveSiteSettings()

  return (
    <footer className="bg-ink-2 text-white">
      <Container className="grid gap-12 py-12 md:grid-cols-[1fr_0.7fr_0.8fr_0.9fr] lg:py-16">
        <div>
          <BrandMark />
          <p className="mt-6 max-w-xs text-sm leading-7 text-white/65">
            Thoughtful design and careful building for homes across Silicon Valley.
          </p>
          <p className="mt-5 text-xs uppercase tracking-[0.14em] text-brass">
            {siteSettings.license}
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
            Quick links
          </p>
          <nav className="grid gap-3 text-sm text-white/70" aria-label="Footer navigation">
            {website.footer.quickLinks.slice(0, 5).map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
            Services
          </p>
          <nav className="grid gap-3 text-sm text-white/70" aria-label="Footer services">
            {website.footer.serviceLinks.map((item) => (
              <Link key={item.label} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-brass">
            Contact
          </p>
          <address className="grid gap-3 text-sm not-italic leading-6 text-white/70">
            <a href={`tel:${siteSettings.phoneClean}`}>{siteSettings.phone}</a>
            <a href={`mailto:${siteSettings.email}`}>{siteSettings.email}</a>
            <a href="https://www.google.com/maps/place/Prime+kitchens+remodeling+San+Jose/@37.3684697,-121.9172543,17z/data=!3m1!4b1!4m6!3m5!1s0x808fcb92f07b591b:0xa445b2611304f808!8m2!3d37.3684697!4d-121.9146794!16s%2Fg%2F11s6b2qvct?shorturl=1">
              416 East Campbell Ave, Campbell CA 95008
            </a>
            <p>3 E 3rd Ave Suite 200, San Mateo, CA 94401</p>
            {siteSettings.addresses.map((address) => (
              <span key={address}>{address}</span>
            ))}
          </address>
        </div>
      </Container>
      <Container>
        <div className="border-t border-white/10 py-5 text-xs text-white/45 flex justify-between">
          <div className=" ">{website.footer.copyright}</div>
          <div>
            <Link href={'/privacy-policy'}>Privacy Policy</Link>
          </div>
        </div>
      </Container>
    </footer>
  )
}
