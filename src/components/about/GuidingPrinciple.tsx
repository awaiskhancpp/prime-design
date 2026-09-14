import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { PageGuidingPrincipleContent as AboutGuidingPrincipleValue } from '@/lib/pageSections'

/**
 * CMS-driven Guiding Principle section. The WordPress page shows two images
 * (prime7-2.jpg + prime13-1.jpg) side by side; a single image keeps the
 * original wide banner layout.
 */
export function GuidingPrinciple({
  guidingPrinciple,
}: {
  guidingPrinciple?: AboutGuidingPrincipleValue
}) {
  const eyebrow = guidingPrinciple?.eyebrow
  const heading = guidingPrinciple?.heading ?? ''
  const image = guidingPrinciple?.image
  const imageSecondary = guidingPrinciple?.imageSecondary
  const ctaLabel = guidingPrinciple?.ctaLabel
  const ctaHref = guidingPrinciple?.ctaHref || '/contact'

  return (
    <Section className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{eyebrow}</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
            <HighlightedText text={heading} highlight={guidingPrinciple?.headingHighlight} />
          </h2>
        </div>

        <div className="max-w-2xl text-base leading-8 text-ink-2/75 md:text-lg">
          {guidingPrinciple?.body ? <RichTextContent data={guidingPrinciple.body} /> : null}
          {ctaLabel ? (
            <Button href={ctaHref} variant="outline" className="mt-8 text-ink-2">
              {ctaLabel} <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>

      {image ? (
        imageSecondary ? (
          <div className="relative mt-16 grid gap-4 md:grid-cols-2">
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image src={image} alt="" fill className="object-cover" />
            </div>
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image src={imageSecondary} alt="" fill className="object-cover" />
            </div>
          </div>
        ) : (
          <div className="relative mt-16 aspect-[16/7] overflow-hidden ">
            <Image src={image} alt="" fill className="object-cover" />
          </div>
        )
      ) : null}
    </Section>
  )
}
