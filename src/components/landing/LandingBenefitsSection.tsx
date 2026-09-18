import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

export type BenefitCard = {
  title: string
  body?: string
  image?: string
}

const paragraphs = (body?: string) =>
  (body || '')
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

const COLUMNS: Record<number, string> = {
  1: 'lg:grid-cols-1',
  2: 'sm:grid-cols-2 lg:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

const SIZES: Record<number, string> = {
  1: '(min-width: 1024px) 90vw, 100vw',
  2: '(min-width: 1024px) 45vw, (min-width: 640px) 45vw, 100vw',
  3: '(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw',
  4: '(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 100vw',
}

export function LandingBenefitsSection({
  eyebrow,
  heading,
  description,
  items = [],
  decorativeImage,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  items?: BenefitCard[]
  decorativeImage?: string
}) {
  const cards = items.filter((item) => item.title)
  if (!cards.length && !heading) return null

  return (
    <Section className="bg-white">
      {eyebrow || heading || description ? (
        <div className="mb-12 max-w-2xl">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-4 text-base leading-7 text-ink-2/70">{description}</p>
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          'grid gap-x-8 gap-y-12 lg:gap-x-10',
          COLUMNS[cards.length] ?? 'sm:grid-cols-2 lg:grid-cols-4',
        )}
      >
        {cards.map((card) => (
          <article key={card.title} className="flex flex-col">
            {card.image ? (
              <div className="group relative aspect-[3/4] w-full overflow-hidden bg-paper-2">
                <Image
                  src={card.image}
                  alt={card.title}
                  fill
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  sizes={SIZES[cards.length] ?? SIZES[4]}
                  unoptimized={
                    card.image.startsWith('http') || card.image.includes('/api/media/file/')
                  }
                />
                {/* Dark gradient — always visible at a low opacity so the
                    card reads as a photo, not a text box. Deepens on hover
                    to ensure text contrast as the overlay slides in. */}
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition-opacity duration-500 ease-out group-hover:opacity-100 opacity-40"
                  aria-hidden
                />
                {/* Text panel — sits below the bottom edge at rest,
                    translates fully into view on hover. */}
                <div className="absolute inset-x-0 bottom-0 translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0 p-6">
                  <div className="border-l-2 border-brass pl-4">
                    <h3 className="font-display text-xl font-medium leading-snug text-white">
                      {card.title}
                    </h3>
                    {paragraphs(card.body).map((p) => (
                      <p key={p} className="mt-2 text-sm leading-6 text-white/80">
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-l-2 border-brass pl-4">
                <h3 className="font-display text-xl font-medium leading-snug text-ink">
                  {card.title}
                </h3>
                {paragraphs(card.body).map((p) => (
                  <p key={p} className="mt-3 text-sm leading-6 text-ink-2/70">
                    {p}
                  </p>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {/* decorativeImage field kept — not rendered per design decision */}
      {decorativeImage ? null : null}
    </Section>
  )
}
