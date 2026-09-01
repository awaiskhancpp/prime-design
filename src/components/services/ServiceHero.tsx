import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { ServiceDetail } from '@/lib/services'

// Real project footage already hosted for the site, used as the full
// background — same idea as the landscaping page's video hero, just
// tied to actual company footage instead of a stock clip.
const AMBIENT_VIDEO_URL =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4'

export function ServiceHero({ service }: { service: ServiceDetail }) {
  const heroVideo = service.heroVideoUrl

  return (
    <section className="relative isolate flex min-h-screen items-end overflow-hidden bg-ink pb-16 pt-16 text-white lg:pb-24">
      {heroVideo ? (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={service.image}
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : (
        <Image
          src={service.image}
          alt=""
          fill
          priority
          className="absolute inset-0 z-0 object-cover"
          sizes="100vw"
        />
      )}

      {/* Same gradient scrim as the landscaping hero — darkest at the
          bottom-left where the text sits, fading out toward the top-right
          so the video still reads clearly. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(20,33,61,0.55)_0%,rgba(20,33,61,0.3)_45%,rgba(20,33,61,0.12)_100%),linear-gradient(0deg,rgba(20,33,61,0.45)_0%,transparent_65%)]" />

      <Container className="relative z-10 w-full">
        <div className="max-w-3xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            {service.eyebrow}
          </p>
          <h1 className="max-w-2xl font-display text-5xl font-medium leading-tight tracking-tight md:text-7xl">
            {service.title}
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg">
            {service.lead}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/contact" variant="primary" size="lg">
              Start your renovation <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              href="/our-projects"
              variant="primary"
              size="lg"
              className="border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white"
            >
              Explore our portfolio <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  )
}
