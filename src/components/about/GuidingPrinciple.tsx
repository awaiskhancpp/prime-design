import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { AboutGuidingPrinciple as AboutGuidingPrincipleValue } from '@/lib/about'

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
  const eyebrow = guidingPrinciple?.eyebrow || 'Our Guiding Principle'
  const heading =
    guidingPrinciple?.heading ||
    'Prime Design & Build\u2019s Promise: Reliability in Every Project We Take On'
  const image = guidingPrinciple?.image
  const imageSecondary = guidingPrinciple?.imageSecondary
  const ctaLabel = guidingPrinciple?.ctaLabel || 'Start your project'
  const ctaHref = guidingPrinciple?.ctaHref || '/contact'

  return (
    <Section className="bg-white">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{eyebrow}</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
            <HighlightedText text={heading} highlight={guidingPrinciple?.headingHighlight} />
          </h2>
        </div>

        <div className="max-w-2xl text-base leading-8 text-ink-2/75 md:text-lg">
          {guidingPrinciple?.body ? (
            <RichTextContent data={guidingPrinciple.body} />
          ) : (
            <>
              <p className="mb-6">
                Our guiding principle is reliability. We believe in working closely with our clients
                to turn their vision into reality, with a commitment to delivering exceptional
                projects on time and within budget. Our team of experienced professionals upholds
                the highest standards of quality, safety, and expertise in every aspect of the
                project, from design to architecture, engineering, and completion.
              </p>
              <p className="mb-6">
                Our reliability sets us apart in the industry and drives our mission to provide the
                best experience for every client, every time.
              </p>
            </>
          )}
          <Button href={ctaHref} variant="line" className="mt-8 text-ink-2">
            {ctaLabel} <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Button>
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
