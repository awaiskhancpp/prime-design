import Image from 'next/image'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { ServiceDetail } from '@/lib/services'

export function ServiceLocationHero({ service }: { service: ServiceDetail }) {
  return (
    <section className="relative bg-paper-2 pb-12 pt-28 md:pb-16 md:pt-36">
      <SiteHeader tone="light" />
      <Container>
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {service.eyebrow}
            </p>
            <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight text-ink md:text-6xl">
              {service.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink-2/75">{service.lead}</p>
            <Button href="#contact" variant="primary" size="lg" className="mt-7">
              Request a quote
            </Button>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-white">
            <Image
              src={service.image}
              alt={`${service.title} project`}
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 100vw"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
