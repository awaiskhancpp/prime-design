import { ArrowUpRight, Check } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function ExpertsSection() {
  const { experts } = website.about

  return (
    <Section className="bg-paper-2">
      <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass-deep">{experts.eyebrow}</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
            {experts.heading}
          </h2>
        </div>
        <div>
          <p className="max-w-2xl text-lg leading-8 text-ink-2/75">{experts.description}</p>
          <div className="mt-10 grid gap-0 border-y border-line sm:grid-cols-2">
            {experts.items.map((item) => (
              <div key={item} className="flex gap-4 border-b border-line py-5 text-ink-2 last:border-b-0 sm:even:border-l sm:even:pl-6">
                <Check className="mt-1 h-5 w-5 shrink-0 text-brass" aria-hidden />
                <span className="text-base leading-7">{item}</span>
              </div>
            ))}
          </div>
          <Button href={experts.ctaHref} variant="line" className="mt-8 text-ink-2">
            {experts.ctaLabel} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>
    </Section>
  )
}
