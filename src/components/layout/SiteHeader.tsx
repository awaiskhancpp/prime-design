import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

import { BrandMark } from './BrandMark'

export function SiteHeader() {
  const primaryLinks = website.nav.filter(({ label }) =>
    ['Home', 'About', 'Services', 'Projects', 'Gallery'].includes(label),
  )

  return (
    <header className="absolute inset-x-0 top-0 z-10 border-b border-white/20 text-white">
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <BrandMark />
        <nav
          className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.12em] lg:flex"
          aria-label="Primary navigation"
        >
          {primaryLinks.map((item) => (
            <Button key={item.label} href={item.href} variant="line" className="text-white">
              {item.label}
            </Button>
          ))}
        </nav>
        <div className="flex items-center gap-5">
          <a
            href={`tel:${website.header.phoneCta.replace(/[^\d+]/g, '')}`}
            className="hidden text-sm font-semibold tracking-wide text-white transition-colors hover:text-brass xl:block"
          >
            {website.header.phoneCta}
          </a>
          <Button href="/contact" size="lg" variant="outline-light">
            Talk to an expert
          </Button>
        </div>
      </Container>
    </header>
  )
}
