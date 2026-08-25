import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { ArrowUpRight } from 'lucide-react'

export function AboutHero() {
  return (
    <section className="relative isolate flex min-h-[680px] items-center overflow-hidden bg-ink py-32 text-white md:min-h-[760px] lg:py-40">
      <Image
        src="/services/home-remodeling.jpeg"
        alt="A finished Prime Design & Build home remodeling project"
        fill
        priority
        className="-z-10 object-cover opacity-40"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
      <SiteHeader />
      <Container>
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">
          About Prime Design & Build
        </p>
        <h1 className="mt-5 max-w-4xl font-display text-6xl font-medium leading-none tracking-tight md:text-8xl">
          ABOUT
        </h1>
        <div className="mt-12 grid max-w-5xl gap-8 border-t border-white/30 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            About us and our story
          </p>
          <div>
            <p className="max-w-2xl text-xl leading-8 text-white md:text-2xl">
              Our company specializes in creating luxurious and functional interiors and exteriors
              for premium clients.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              We combine innovative design, high-quality materials, and careful attention to detail
              so every project reflects the people who live there.
            </p>
            <Button href="/contact" variant="line" className="mt-8 text-white">
              Start a conversation <ArrowUpRight />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
