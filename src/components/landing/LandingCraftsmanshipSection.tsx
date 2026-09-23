import Image from '@/components/ui/Image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * LandingCraftsmanshipSection
 *
 * The WordPress "Remodel Your Entire Home With Prime Design & Build" section
 * (`crempi` on remodeling-information): a heading, two cards that each carry a
 * photograph, a title and two paragraphs, and two standalone photographs.
 *
 * ── The layout ────────────────────────────────────────────────────────────
 *
 * The source was a three-column Bricks layout staggered with a 240px spacer in
 * the first column and a 140px one in the second, and that stagger used to be
 * reproduced here. On a Google Ads landing page it read as breakage rather
 * than rhythm: the heading column carried a screen's worth of white space
 * above its card, the third column trailed off under its copy, and the
 * decorative graphic floated in the gap between them.
 *
 * It is now two equal columns, each one complete: a card, and beneath it the
 * standalone photograph paired with it by position. The bodies differ by
 * about sixty characters, so the photographs are pushed down by `mt-auto`
 * rather than following the text — both columns then end on the same line,
 * which is the part read as alignment, while the copy above stays its natural
 * length instead of being padded to match.
 *
 * ── The card ──────────────────────────────────────────────────────────────
 *
 * Photograph, then a rule that starts brass and runs out in `line` to the
 * column edge, then the title and the copy. The brass-into-hairline rule is
 * this site's own accent idiom, and it deliberately avoids both of the card
 * treatments already in use — the projects card's paper plate and the
 * services card's full border — because this is neither a project nor a
 * service, but a description of how the work is done.
 *
 * `decorativeImage` is still accepted and deliberately not rendered. The
 * WordPress graphic is a ring of dots that had nothing to sit against once
 * the stagger went, and dropping the prop would silently discard a populated
 * CMS field.
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

const isRemote = (src: string) => src.startsWith('http') || src.includes('/api/media/file/')

function PhotoCard({ card, priority = false }: { card: CraftsmanshipCard; priority?: boolean }) {
  return (
    <article className="flex flex-col">
      {card.image ? (
        <div className="relative aspect-[3/2] w-full overflow-hidden bg-paper-2">
          <Image
            src={card.image}
            alt={card.title}
            fill
            priority={priority}
            className="object-cover"
            sizes="(min-width: 1024px) 45vw, 100vw"
            unoptimized={isRemote(card.image)}
          />
        </div>
      ) : null}

      {/* Brass into hairline, out to the column edge. */}
      {/* <span aria-hidden className="mt-6 flex items-center">
        <span className="h-0.5 w-10 bg-brass" />
        <span className="h-px flex-1 bg-line" />
      </span> */}

      <h3 className="mt-5 font-display text-2xl font-medium leading-tight text-ink md:text-[1.75rem]">
        {card.title}
      </h3>

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
    <div className="relative aspect-[3/2] w-full overflow-hidden bg-paper-2">
      <Image
        src={src}
        alt=""
        fill
        className="object-cover"
        sizes="(min-width: 1024px) 45vw, 100vw"
        unoptimized={isRemote(src)}
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
  // Bound to an underscore because it is deliberately unused: the prop stays
  // in the signature so the CMS field is not silently dropped, but nothing
  // renders it. See the note above.
  decorativeImage: _decorativeImage,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  cards?: CraftsmanshipCard[]
  images?: string[]
  /**
   * Accepted so the CMS field is not silently dropped, and intentionally not
   * rendered — see the note above.
   */
  decorativeImage?: string
}) {
  const usableCards = cards.filter((card) => card.title)
  const usablePhotos = images.filter(Boolean)
  if (!eyebrow && !heading && !usableCards.length && !usablePhotos.length) return null

  // One column per card, each paired with the photograph in the same position.
  // A photograph with no card of its own still gets a column, so nothing in
  // the block goes unrendered.
  const columns = Math.max(usableCards.length, usablePhotos.length)

  return (
    <Section className="bg-white">
      {heading || eyebrow ? (
        <SectionHeader
          align="center"
          size="sm"
          eyebrow={eyebrow}
          title={heading ?? ''}
          description={description}
        />
      ) : null}

      <div
        className={
          columns > 1
            ? 'mt-12 grid gap-x-10 gap-y-8 lg:grid-cols-2 lg:gap-x-12'
            : 'mt-12 grid gap-8'
        }
      >
        {Array.from({ length: columns }, (_, index) => {
          const card = usableCards[index]
          const photo = usablePhotos[index]
          return (
            <div key={card?.title ?? photo ?? index} className="flex h-full flex-col">
              {card ? <PhotoCard card={card} priority={index === 0} /> : null}
              {photo ? (
                <div className={card ? 'mt-auto pt-8' : ''}>
                  <Photo src={photo} />
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </Section>
  )
}
