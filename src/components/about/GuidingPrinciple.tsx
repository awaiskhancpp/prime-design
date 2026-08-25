import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function GuidingPrinciple() {
  const { guidingPrinciple } = website.about

  return (
    <Section className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{guidingPrinciple.eyebrow}</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
            {guidingPrinciple.heading}
          </h2>
        </div>

        <div className="max-w-2xl text-base leading-8 text-ink-2/75 md:text-lg">
          {guidingPrinciple.paragraphs.map((paragraph) => <p key={paragraph} className="mb-6 last:mb-0">{paragraph}</p>)}
          <p className="mt-8 font-display text-2xl text-ink-2">{guidingPrinciple.signature}</p>
          <Button href="/contact" variant="line" className="mt-8 text-ink-2">
            Start your project <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </div>

      <div className="relative mt-16 aspect-[16/7] overflow-hidden bg-paper-2">
        <Image src={guidingPrinciple.image} alt={guidingPrinciple.imageAlt} fill className="object-cover" />
      </div>
    </Section>
  )
}
