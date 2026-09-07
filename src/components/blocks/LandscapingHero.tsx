import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { ArrowRight, CalendarDays } from 'lucide-react'

export function LandscapingHero() {
  return (
    <section className="relative isolate flex min-h-screen items-end overflow-hidden bg-ink pb-16 pt-36 text-white  lg:pb-24">
      <video
        className="absolute inset-0 z-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/services/home-remodeling.jpeg"
        aria-hidden="true"
      >
        <source
          src="/Prime%20Design%20Build%20Silicon%20Valleys%20Premier%20Home%20Remodeling%20Exper.mp4"
          type="video/mp4"
        />
      </video>
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(20,33,61,0.9)_0%,rgba(20,33,61,0.68)_45%,rgba(20,33,61,0.38)_100%),linear-gradient(0deg,rgba(20,33,61,0.76)_0%,transparent_65%)]" />
      {/* <div className="pointer-events-none absolute inset-0 z-[1] opacity-20 [background-image:linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.35)_45%,transparent_46%),linear-gradient(45deg,transparent_0%,rgba(255,255,255,0.18)_50%,transparent_51%)] [background-size:4rem_4rem]" /> */}
      <SiteHeader />
      <Container className="relative z-10 w-full">
        <div className="max-w-3xl">
          <h1 className="max-w-2xl font-display text-5xl font-medium leading-tight tracking-tight md:text-7xl">
            Top-rated design and build firm in the Bay Area
          </h1>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button href="/contact" variant="primary">
              <CalendarDays /> Schedule a Consultation <ArrowRight />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
