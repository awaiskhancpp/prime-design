import Image from '@/components/ui/Image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { WAVE_BACKGROUND } from '@/lib/assets'

/**
 * "Silicon Valley's Luxury Home Contractor" band.
 *
 * WordPress footer template (id 78), section `ffa2e5` — the copy below is the
 * section's own heading / body / button, plus its "Need a new kitchen,
 * bathroom, or complete home renovation?" line as the eyebrow. WordPress lays
 * it over attachment 3645 (the flowing wave); the image is kept and washed
 * with the brand ink so the wave reads as texture and the copy stays legible.
 */
export function LandscapingCta() {
  return (
    // Named, so this band between the page and the footer is a region
    // landmark rather than content outside any landmark.
    <section
      aria-labelledby="site-cta-heading"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      <Image
        src={WAVE_BACKGROUND}
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover object-top opacity-60"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-ink/65 via-ink/=75 to-ink"
        aria-hidden="true"
      />

      <Container className="relative flex flex-col items-center py-20 text-center sm:py-24 lg:py-28">
        <p className="mx-auto max-w-3xl text-[10px] font-semibold uppercase leading-5 tracking-[0.18em] text-brass sm:text-[11px] sm:tracking-[0.22em]">
          Need a new kitchen, bathroom, or complete home renovation?
        </p>

        <h2
          id="site-cta-heading"
          className="mx-auto mt-6 max-w-4xl font-display text-4xl font-medium leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
          Silicon Valley&apos;s Luxury Home Contractor
        </h2>

        <span
          className="mt-8 h-px w-24 bg-gradient-to-r from-transparent via-brass to-transparent"
          aria-hidden="true"
        />

        <p className="mx-auto mt-8 max-w-4xl text-base leading-8 text-white/70">
          At Prime Design &amp; Build, we stand proudly as one of Silicon Valley&apos;s premier
          remodeling and construction authorities, specializing in a wide range of high-quality
          services tailored to meet your specific needs. Our well-established reputation is built on
          a foundation of quality craftsmanship and unparalleled customer service. Our dedicated
          team ensures a custom-tailored interaction with every client, guaranteeing that our high
          standards are consistently met with each project we undertake.
        </p>

        <Button href="/contact" variant="brass" size="lg" arrow className="mt-10">
          Let&apos;s get started
        </Button>
      </Container>
    </section>
  )
}
