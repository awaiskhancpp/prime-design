import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

import BeforeAfterSlider from './BeforeAfterSlider'
import { SectionHeader } from '../ui/SectionHeader'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { HomepageFeatureBlocks as HomepageFeatureBlocksValue } from '@/lib/homepage'

export function HomeFeatureBlocks({
  featureBlocks,
}: {
  featureBlocks?: HomepageFeatureBlocksValue
}) {
  const eyebrow = featureBlocks?.eyebrow
  const title = featureBlocks?.title
  const items = featureBlocks?.items ?? []

  return (
    <Section className="bg-white">
      {/* Single Section Header */}
      <SectionHeader
        eyebrow={eyebrow}
        title={<HighlightedText text={title || ''} highlight={featureBlocks?.titleHighlight} />}
        align="center"
      />

      {/* Container for all feature blocks */}
      {items.length ? (
        <div className="mt-12 flex flex-col gap-10">
          {items.map((block, index) => {
            const reversed = index % 2 === 1

            return (
              <div key={block.title} className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <div className={cn(reversed && 'lg:order-2')}>
                  <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
                    {block.title}
                  </h2>
                  <div className="mt-5 max-w-lg text-base leading-7 text-ink-2/70">
                    <RichTextContent data={block.body} />
                  </div>
                  {block.ctaLabel ? (
                    <Button href={block.ctaHref || '/contact'} variant="secondary" className="mt-7">
                      {block.ctaLabel}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </Button>
                  ) : null}
                </div>

                <div className={cn(reversed && 'lg:order-1')}>
                  <BeforeAfterSlider
                    beforeImage={
                      block.beforeImage || '/before-after/bathroom_remodeling_before.jpg'
                    }
                    afterImage={block.afterImage || '/before-after/bathroom_remodeling_after.jpeg'}
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
      ) : null}
    </Section>
  )
}
