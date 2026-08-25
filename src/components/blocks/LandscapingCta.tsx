import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function LandscapingCta() {
  return (
    <Section className="bg-ink-2 pb-0 text-white">
      <div className="px-8 text-center">
        <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          <span className="h-1.5 w-1.5 animate-blink-slow rounded-full bg-brass" aria-hidden />
          Now scheduling consultations
        </p>
        <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
          Ready to build something extraordinary?
        </h2>
        <p className="mx-auto mt-5 max-w-md text-base leading-7 text-white/70">
          Take the first step and schedule a free consultation with our team.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center">
          <Button
            href={website.hero.ctaHref}
            variant="primary"
            className="border-brass bg-brass text-ink hover:bg-brass/90 hover:text-ink"
          >
            Let&apos;s Get Started
          </Button>
        </div>
      </div>
    </Section>
  )
}
