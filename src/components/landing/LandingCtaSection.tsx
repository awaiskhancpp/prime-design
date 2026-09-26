import { ArrowRight } from 'lucide-react'
import Image from '@/components/ui/Image'

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
  /** Optional — some source CTA sections are a bare button band. */
  heading?: string
  description?: string
  cta?: { label: string; href: string }
  image?: string
}) {
  return (
    <Section className="bg-brass-light text-ink">
      <div className={`grid gap-8 md:items-start ${image ? 'md:grid-cols-[280px_1fr]' : ''}`}>
        {image ? (
          /* Full width on a phone, where the band is a single column and a
             280px photo left a third of the row empty beside it; the 280px
             cap returns at `md`, where the grid puts the copy alongside. */
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink-2/10 md:max-w-[280px]">
            <Image
              src={image}
              alt={heading || ''}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 280px, 100vw"
            />
          </div>
        ) : null}
        <div className="text-left">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em]">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium md:text-5xl">{heading}</h2>
          ) : null}
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
