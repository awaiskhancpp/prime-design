import Image from 'next/image'
import Link from 'next/link'

import { Section } from '@/components/ui/Section'

type SubService = {
  title: string
  description?: string
  image?: string
  link?: string
}

export function LandingSubServicesSection({
  eyebrow,
  heading,
  description,
  items,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  items: SubService[]
}) {
  if (!items.length) return null

  return (
    <Section className="relative overflow-hidden bg-white">
      <div className="relative z-10 max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
        ) : null}
        {heading ? (
          <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">{heading}</h2>
        ) : null}
        {description ? <p className="mt-5 max-w-2xl text-base leading-7 text-ink-2/75">{description}</p> : null}
      </div>

      <div className="relative z-10 mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3 md:items-start">
        {items.map((item, index) => (
          <article
            key={`${item.title}-${index}`}
            className={index % 3 === 1 ? 'md:mt-16' : index % 3 === 2 ? 'md:mt-[-2rem]' : undefined}
          >
            {item.image ? (
              <div className="relative aspect-[4/5] overflow-hidden bg-paper-2">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 33vw, 100vw"
                  unoptimized={item.image.startsWith('http') || item.image.includes('/api/media/file/')}
                />
              </div>
            ) : null}
            <div className="pt-5">
              <h3 className="font-display text-2xl font-medium text-ink">{item.title}</h3>
              {item.description ? (
                <p className="mt-3 max-w-sm text-sm leading-6 text-ink-2/75">{item.description}</p>
              ) : null}
              {item.link ? (
                <Link
                  href={item.link}
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brass-deep"
                >
                  Learn more →
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute -bottom-20 right-[-4rem] h-64 w-64 rounded-full bg-paper-2" aria-hidden>
        <span className="absolute bottom-8 right-8 h-24 w-24 opacity-70 [background-image:radial-gradient(circle,_#e9b85f_2px,_transparent_2px)] [background-size:18px_18px]" />
      </div>
    </Section>
  )
}
