import Image from 'next/image'
import Link from 'next/link'

import { Section } from '@/components/ui/Section'

type ProjectItem = {
  title: string
  image?: string
  link?: string
}

export function LandingProjectGridSection({
  eyebrow,
  heading,
  description,
  items,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  items: ProjectItem[]
}) {
  if (!items.length) return null

  return (
    <Section className="bg-white">
      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-10">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brass">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">
              {heading}
            </h2>
          ) : null}
        </div>
        {description ? <p className="text-base leading-7 text-ink-2/70">{description}</p> : null}
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const card = (
            <article className="group relative aspect-[4/3] overflow-hidden bg-paper-2">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  unoptimized={item.image.startsWith('http') || item.image.includes('/api/media/file/')}
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              ) : null}
              <div className="absolute inset-x-3 top-3">
                <span className="inline-block max-w-full bg-white px-3 py-2 text-xs font-semibold leading-tight text-ink shadow-sm">
                  {item.title}
                </span>
              </div>
            </article>
          )

          return item.link ? (
            <Link key={item.title} href={item.link} aria-label={`View project: ${item.title}`}>
              {card}
            </Link>
          ) : (
            <div key={item.title}>{card}</div>
          )
        })}
      </div>
    </Section>
  )
}
