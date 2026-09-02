import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function LandingLuxuryCta({
  eyebrow,
  heading,
  body,
  link = '/contact',
}: {
  eyebrow?: string
  heading?: string
  body?: string
  link?: string
}) {
  return (
    <Section className="bg-brass text-ink">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
            <Home className="h-4 w-4" aria-hidden />
            {eyebrow || 'Need a new renovation?'}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-5xl">
            {heading || "Silicon Valley's Luxury Home Contractor"}
          </h2>
          {/* <Button href={link} variant="primary" className="mt-6 bg-ink text-white hover:bg-ink-2">
            Let&apos;s get started →
          </Button> */}
        </div>
        {body ? <p className="text-base leading-7">{body}</p> : null}
      </div>
    </Section>
  )
}
