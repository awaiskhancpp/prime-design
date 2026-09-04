import { ArrowRight } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

/**
 * LandingCtaSection
 *
 * The brass CTA band under the hero on most landing pages. Matches the
 * original WordPress layout: a compact, bounded photo on the left,
 * left-aligned heading/description/button on the right — not a centered
 * text-only band, and not a photo stretched to match the text block's
 * height. The button is an outline box with a trailing arrow, same as
 * the source design, rather than a solid filled button.
 */
export function LandingCtaSection({
  eyebrow,
  heading,
  description,
  cta,
  image,
}: {
  eyebrow?: string
  heading: string
  description?: string
  cta?: { label: string; href: string }
  image?: string
}) {
  return (
    <Section className="bg-brass text-ink">
      <div className={`grid gap-8 md:items-start ${image ? 'md:grid-cols-[280px_1fr]' : ''}`}>
        {image ? (
          <div className="relative aspect-[4/3] w-full max-w-[280px] overflow-hidden  bg-ink-2/10">
            <Image src={image} alt={heading} fill className="object-cover" sizes="280px" />
          </div>
        ) : null}
        <div className="text-left">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{eyebrow}</p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-medium md:text-5xl">{heading}</h2>
          {description ? <p className="mt-4 text-base leading-7">{description}</p> : null}
          {cta ? (
            <Button
              href={cta.href}
              variant="outline"
              className="mt-6 flex w-fit items-center gap-2 border-ink text-ink hover:bg-ink hover:text-white"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
