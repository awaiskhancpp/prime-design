import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import type { ServiceDetail } from '@/lib/services'
import type { Location } from '@/lib/serviceLocations'

export type ServiceDontSettleContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  body: string
  image: string
  cta: { label: string; href: string }
}

const spaceWordBySlug: Record<string, string> = {
  'kitchen-remodeling': 'kitchen',
  'bathroom-remodeling': 'bathroom',
  'home-remodeling': 'home',
}

export function ServiceDontSettleSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  image,
  cta,
}: ServiceDontSettleContent) {
  return (
    <Section className="bg-white">
      <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1fr] lg:gap-20">
        <div className="relative">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2">
            <Image
              src={image}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 32vw, 85vw"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrow}
          </p>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
            {heading}{' '}
            <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
              {headingAccent}
            </span>
          </h2>
          <p className="mt-6 text-base leading-8 text-ink-2/75">{body}</p>
          <div className="mt-9">
            <Button href={cta.href} variant="outline" size="lg">
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
