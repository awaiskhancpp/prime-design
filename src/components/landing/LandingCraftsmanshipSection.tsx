import Image from '@/components/ui/Image'

import { Section } from '@/components/ui/Section'

/**
 * LandingCraftsmanshipSection
 *
 * The WordPress "Remodel Your Entire Home With Prime Design & Build" section
 * (`crempi` on remodeling-information). The source is a three-column Bricks
 * layout with deliberate vertical offsets:
 *
 *   column 1  eyebrow + heading, a 240px spacer, then the first photo card
 *   column 2  a 140px spacer, then two standalone photos
 *   column 3  the second photo card, then a decorative graphic
 *
 * That stagger is the whole character of the section, so it is preserved
 * here rather than flattened into an even grid. Everything else — type
 * scale, brass accents, the Section wrapper — follows this project's design
 * language instead of the Bricks styling.
 *
 * Every string and image is a prop. There are no defaults: a field the CMS
 * has not filled renders as nothing, so a broken wiring is visible rather
 * than masked by stand-in copy.
 */

export type CraftsmanshipCard = {
  title: string
  /** Blank-line separated paragraphs, as authored in WordPress. */
  body?: string
  image?: string
}

const paragraphs = (body?: string) =>
  (body || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

function PhotoCard({ card, priority = false }: { card: CraftsmanshipCard; priority?: boolean }) {
  return (
    <article>
      {card.image ? (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2 shadow-lg shadow-ink/10">
          <Image
            src={card.image}
            alt={card.title}
            fill
            priority={priority}
            className="object-cover"
            sizes="(min-width: 1024px) 30vw, 100vw"
            unoptimized={card.image.startsWith('http') || card.image.includes('/api/media/file/')}
          />
        </div>
      ) : null}
      <h3 className="mt-6 font-display text-2xl font-medium leading-tight text-ink md:text-3xl">
        {card.title}
      </h3>
      <span aria-hidden className="mt-4 block h-px w-12 bg-brass" />
      {paragraphs(card.body).map((paragraph) => (
        <p key={paragraph} className="mt-4 text-base leading-7 text-ink-2/70">
          {paragraph}
        </p>
      ))}
    </article>
  )
}

/**
 * A standalone photo from the source column. These carry no caption and no
 * alt text in WordPress, and they sit beside cards that already describe the
 * work, so they are presentational here — `alt=""` rather than an invented
 * description.
 */
function Photo({ src }: { src: string }) {
  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2 shadow-lg shadow-ink/10">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 30vw, 100vw"
        unoptimized={src.startsWith('http') || src.includes('/api/media/file/')}
      />
    </div>
  )
}

export function LandingCraftsmanshipSection({
  eyebrow,
  heading,
  description,
  cards = [],
  images = [],
  decorativeImage,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  cards?: CraftsmanshipCard[]
  images?: string[]
  decorativeImage?: string
}) {
  const usableCards = cards.filter((card) => card.title)
  const usablePhotos = images.filter(Boolean)
  if (!eyebrow && !heading && !usableCards.length && !usablePhotos.length) return null

  const [firstCard, secondCard] = usableCards

  return (
    <Section className="bg-white">
      <div className="grid gap-x-10 gap-y-12 lg:grid-cols-3 lg:gap-x-12">
        {/* Column 1 — the section's copy, with its card pushed below it. */}
        <div className="flex flex-col">
          {eyebrow ? (
            <p className="max-w-[270px] text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-5 font-display text-2xl font-medium leading-snug tracking-tight text-ink md:text-[1.75rem]">
              {heading}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-5 text-base leading-7 text-ink-2/70">{description}</p>
          ) : null}
          {firstCard ? (
            <div className="mt-10 lg:mt-auto lg:pt-24">
              <PhotoCard card={firstCard} priority />
            </div>
          ) : null}
        </div>

        {/* Column 2 — standalone photos, offset to break the baseline. */}
        {usablePhotos.length ? (
          <div className="grid content-start gap-10 lg:pt-36">
            {usablePhotos.map((src) => (
              <Photo key={src} src={src} />
            ))}
          </div>
        ) : null}

        {/* Column 3 — the second card, then the decorative graphic. */}
        <div className="flex flex-col">
          {secondCard ? <PhotoCard card={secondCard} /> : null}
          {decorativeImage ? (
            <div className="relative mt-10 hidden h-28 w-1/2 self-start lg:block">
              <Image
                src={decorativeImage}
                alt=""
                fill
                aria-hidden
                className="object-contain object-left"
                sizes="20vw"
                unoptimized={
                  decorativeImage.startsWith('http') ||
                  decorativeImage.includes('/api/media/file/')
                }
              />
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
