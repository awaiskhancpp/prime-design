import Link from 'next/link'
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em]">
            {eyebrow || 'Need a new renovation?'}
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium md:text-5xl">
            {heading || "Silicon Valley's Luxury Home Contractor"}
          </h2>
        </div>
        {body ? <p className="text-base leading-7">{body}</p> : null}
      </div>
      <Link href={link} className="mt-8 inline-flex bg-white px-5 py-3 text-sm font-semibold">
        Let&apos;s get started →
      </Link>
    </Section>
  )
}
