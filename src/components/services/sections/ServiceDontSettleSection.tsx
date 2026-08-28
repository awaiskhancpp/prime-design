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

export function getDontSettleContent(
  service: ServiceDetail,
  location: Location,
): ServiceDontSettleContent {
  const spaceWord = spaceWordBySlug[service.slug] ?? 'space'
  const spaceWordCap = spaceWord[0].toUpperCase() + spaceWord.slice(1)
  const gallery = [...new Set([...service.gallery, service.image])].filter(Boolean)

  return {
    eyebrow: `${service.title} in ${location.name}`,
    heading: "Don't Settle for a Mediocre",
    headingAccent: `${spaceWordCap} in ${location.name}`,
    body: `As a homeowner in ${location.name}, you understand the significance of creating a ${spaceWord} that stands out and makes a statement. At Prime Design & Build, we specialize in ${service.title} in ${location.name}, bringing your vision to life with our high-quality craftsmanship and attention to detail. Whether you're looking for a modern, sleek design or a timeless, classic style, our team of experts will transform your ${spaceWord} into a space that reflects your unique taste and enhances your home. With our custom ${service.title.toLowerCase()} services, we ensure that every detail is tailored to your needs, providing you with a ${spaceWord} that surpasses your expectations.`,
    image: gallery[gallery.length - 2] ?? service.image,
    cta: { label: 'Talk to an expert', href: '#contact' },
  }
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
