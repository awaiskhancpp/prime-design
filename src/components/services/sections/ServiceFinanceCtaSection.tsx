import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

/**
 * Finance page "Let's work together to finance your renovation" section —
 * the WordPress design: full-bleed background image with a dark shade
 * overlay and centered white heading, body and brass CTA button.
 */
export function ServiceFinanceCtaSection({
  heading,
  description,
  image,
  cta,
}: {
  heading: string
  description?: string
  image?: string
  cta?: { label: string; href: string }
}) {
  return (
    <Section className="relative isolate overflow-hidden bg-ink text-white">
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          className="absolute inset-0 z-0 object-cover"
          sizes="100vw"
        />
      ) : null}

      {/* WordPress overlay: var(--shade-trans-60). */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-ink/60" />

      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">
          {heading}
        </h2>
        {description ? (
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 md:text-lg">{description}</p>
        ) : null}
        {cta ? (
          <Button
            href={cta.href}
            size="lg"
            className="mt-9 border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        ) : null}
      </div>
    </Section>
  )
}
