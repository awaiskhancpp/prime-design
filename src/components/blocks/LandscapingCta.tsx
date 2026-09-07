import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { ArrowRight } from 'lucide-react'

export function LandscapingCta() {
  return (
    <Section className="bg-ink-2 pb-0 text-white">
      <div className="px-8 text-center">
        <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          <span className="h-1.5 w-1.5 animate-blink-slow rounded-full bg-brass" aria-hidden />
          Need a new kitchen, bathroom, or complete home renovation?
        </p>
        <h2 className="mx-auto max-w-7xl font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
          Silicon Valley&apos;s Luxury Home Contractor
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/70">
          At Prime Design & Build, we stand proud as one of Silicon Valley&apos;s premium remodeling
          and construction authorities, specializing in a wide range of high-quality services
          tailored to meet your specific needs. Our well-established reputation is built on a
          foundation of quality craftsmanship and unparalleled customer service. Our dedicated team
          ensures a custom-tailored interaction with every client, guaranteeing that our high
          standards are consistently met with each project we undertake.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center">
          <Button
            href={website.hero.ctaHref}
            variant="primary"
            className="border-brass bg-brass text-ink hover:bg-brass/90 hover:text-ink"
          >
            Let&apos;s Get Started <ArrowRight />
          </Button>
        </div>
      </div>
    </Section>
  )
}
