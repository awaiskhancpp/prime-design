import { ArrowRight } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

import BeforeAfterSlider from './BeforeAfterSlider'
import { SectionHeader } from '../ui/SectionHeader'

export function HomeFeatureBlocks() {
  return (
    <Section className="bg-white">
      {/* Single Section Header */}
      <SectionHeader
        eyebrow="Remodel Your Entire Home With Prime Design & Build"
        title="We don't just build Kitchens, We do it all."
        align="center"
      />

      {/* Container for all feature blocks */}
      <div className="mt-12 flex flex-col gap-16 lg:gap-24">
        {website.featureBlocks.map((block, index) => {
          const reversed = index % 2 === 1

          return (
            <div key={block.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={cn(reversed && 'lg:order-2')}>
                <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
                  {block.title}
                </h2>
                <p className="mt-5 max-w-lg text-base leading-7 text-ink-2/70">{block.body}</p>
                <Button href={block.ctaHref} variant="secondary" className="mt-7">
                  {block.ctaLabel}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              </div>

              <div className={cn(reversed && 'lg:order-1')}>
                <BeforeAfterSlider
                  beforeImage={block.beforeImage}
                  afterImage={block.afterImage}
                  beforeAlt={`${block.title} — before`}
                  afterAlt={`${block.title} — after`}
                />
                <div className="mt-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-ink-2/60">
                  <span>Before</span>
                  <span>After</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Section>
  )
}
