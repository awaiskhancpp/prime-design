import { Section } from '@/components/ui/Section'

export function LandscapingCta() {
  return (
    <Section className="bg-ink-2 pb-0 text-white">
      <div className="px-8 text-center">
        <p className="mb-5 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          <span className="h-1.5 w-1.5 animate-blink-slow rounded-full bg-brass" aria-hidden />
          Need a new kitchen renovation?
        </p>
        <h2 className="mx-auto max-w-7xl font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
          Silicon Valley&apos;s Luxury Home Contractor
        </h2>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/70">
          At Prime Design &amp; Build, we stand proudly as one of Silicon Valley&apos;s premier
          remodeling and construction authorities, specializing in a wide range of high-quality
          services tailored to meet your specific needs. Our well-established reputation is built
          on a foundation of quality craftsmanship and unparalleled customer service. Our
          dedicated team ensures a custom-tailored interaction with every client, guaranteeing
          that our high standards are consistently met with each project we undertake.
        </p>
      </div>
    </Section>
  )
}
