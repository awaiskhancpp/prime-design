'use client'

import type { ReactNode } from 'react'
import Image from '@/components/ui/Image'
import { Star } from 'lucide-react'

import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'
import type { PageIntroContent } from '@/lib/pageSections'
import type { SiteSettingsValue } from '@/lib/siteSettings'

/**
 * WordPress homepage review badges (Bricks image elements whose `link` is the
 * matching ACF option: `{acf_yelp}`, `{acf_google_business_link}`,
 * `{acf_houzz}`, `{acf_bbb}`). The URLs come from Site Settings; the `key`
 * maps each badge to its link field. `width`/`height` are each file's real
 * pixel size — the row is sized by height so nothing gets squashed.
 *
 * These used to open `LandscapingDifference`, one section further down, in a
 * `border-y` band of their own. They belong here instead: see `ProofBand`.
 */
const socialBadges = [
  { key: 'yelp', image: '/social/Yelp.png', label: 'Yelp reviews', width: 300, height: 158 },
  {
    key: 'googleBusiness',
    image: '/social/Google.png',
    label: 'Google reviews',
    width: 300,
    height: 158,
  },
  { key: 'houzz', image: '/social/houzz.png', label: 'Houzz profile', width: 300, height: 158 },
  {
    key: 'bbb',
    image: '/social/BB-ACCREDITED.jpeg',
    label: 'Better Business Bureau accredited business',
    width: 300,
    height: 114,
  },
] as const

const RATING = 4.9
const RATING_OUT_OF = 5
const RATING_LABEL = 'Google & Yelp Reviews'

/** One row of five stars, filled with whatever colour it inherits. */
function StarRow({ className }: { className?: string }) {
  return (
    <span className={cn('flex gap-1', className)}>
      {Array.from({ length: RATING_OUT_OF }, (_, i) => (
        <Star key={i} className="h-[18px] w-[18px] shrink-0" fill="currentColor" strokeWidth={0} />
      ))}
    </span>
  )
}

/**
 * The score as stars, filled to the real fraction rather than rounded up.
 *
 * A brass row is clipped over a `line`-coloured row, so 4.9 renders as four
 * full stars and one filled to nine tenths. Rounding 4.9 up to five identical
 * stars would be the easy version and also a small lie, on the one number on
 * this page a visitor can go and check for themselves.
 */
function RatingStars() {
  return (
    <span
      className="relative inline-flex"
      role="img"
      aria-label={`${RATING} out of ${RATING_OUT_OF} stars`}
    >
      <StarRow className="text-line" />
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${(RATING / RATING_OUT_OF) * 100}%` }}
      >
        <StarRow className="text-brass" />
      </span>
    </span>
  )
}

/**
 * The proof band — the first thing under the dark hero.
 *
 * The score and the profiles it comes from are one argument: the number is the
 * claim, the badges are where a visitor goes to check it. They used to be two
 * strips a whole section apart, the stats opening this section and the badges
 * opening `LandscapingDifference`, so the claim and its evidence were split by
 * an unrelated block of body copy.
 *
 * ── Why it is built this way ──────────────────────────────────────────────
 *
 * The badges are four third-party images with nothing in common: Google and
 * Yelp are transparent wordmarks, Houzz carries its own six-pixel caption, and
 * the BBB one is a solid filled rectangle that outweighs the rest. Left to
 * themselves in a centred flex row they read as clip art — different masses,
 * no shared baseline, and a pool of dead space on either side.
 *
 * So the row is a hairline grid instead. Every badge gets an identical cell
 * and sits centred in it, which gives the set a rhythm the images do not have
 * on their own, and `gap-px` over a `bg-line` parent draws the rules: no cell
 * needs to know which edges it is on, so the same markup is a 2x2 block on a
 * phone and a single row from `sm`.
 *
 * The band is bounded by rules rather than boxed. A 1px rectangle floating in
 * white reads as an unfinished placeholder; `border-y` spanning the measure is
 * the editorial idiom this site already uses, and it lets the surrounding
 * white space read as air rather than as a gap around a stray card.
 */
function ProofBand({ socialLinks }: { socialLinks?: SiteSettingsValue['socialLinks'] }) {
  return (
    <div className="mb-16 border border-line">
      <div className="flex flex-col gap-px bg-line lg:flex-row lg:items-stretch">
        {/*
          The score, as a lockup rather than a stranded chip: the numeral and
          the stars read together left to right, the way a rating is written
          everywhere else, with the label tucked under them.
        */}
        <div className="flex items-center justify-center gap-4 bg-white px-6 py-6 lg:px-10">
          <span className="font-display text-4xl font-medium leading-none text-ink md:text-5xl">
            {RATING}
          </span>
          <span className="flex flex-col gap-2">
            <RatingStars />
            <span className="text-[10px] font-semibold uppercase leading-none tracking-[0.16em] text-ink-2/45">
              {RATING_LABEL}
            </span>
          </span>
        </div>

        {/* Where to go and check. Four across only once each cell has room
            for the widest badge: at 768px a four-column row left 100px cells
            and squashed the BBB block against its neighbour. */}
        <div className="grid flex-1 grid-cols-2 gap-px bg-line md:grid-cols-4">
          {socialBadges.map((badge) => {
            const href = socialLinks?.[badge.key]
            const image = (
              <Image
                src={badge.image}
                // Linked, the anchor carries the accessible name and the image
                // would only repeat it. Unlinked there is no anchor, so the
                // badge would otherwise be invisible to a screen reader.
                alt={href ? '' : badge.label}
                aria-hidden={href ? 'true' : undefined}
                width={badge.width}
                height={badge.height}
                className="h-9 w-auto max-w-full object-contain opacity-90 transition duration-300 group-hover:opacity-100 sm:h-10"
              />
            )

            return (
              <div key={badge.key} className="flex items-center justify-center bg-white px-4 py-5">
                {href ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${badge.label} (opens in a new tab)`}
                    className="group inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-4"
                  >
                    {image}
                  </a>
                ) : (
                  <span className="group inline-flex items-center justify-center">{image}</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function LandscapingIntro({
  intro,
  bodyContent,
  socialLinks,
}: {
  intro?: PageIntroContent
  bodyContent?: ReactNode
  /** Review-profile URLs from Site Settings (Google / Yelp / Houzz / BBB). */
  socialLinks?: SiteSettingsValue['socialLinks']
}) {
  const heading = intro?.heading ?? ''
  const image = intro?.image

  return (
    <section className="pt-12 pb-20 md:pt-16 md:pb-28">
      <Container>
        <ProofBand socialLinks={socialLinks} />

        {/* Body */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {intro?.eyebrow ?? "Silicon Valley's Design-Build Team"}
            </p>
            <span aria-hidden className="mt-4 block h-0.5 w-10 bg-brass" />
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
              {heading}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-2/70">
              {bodyContent}
            </div>
          </div>

          {/* Single image with brass offset frame */}
          {image ? (
            <div className="relative">
              {/* Brass accent block — sits behind and offset top-left,
                  creates depth without a second image or background */}

              <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl shadow-ink/15">
                <Image
                  src={image}
                  alt={intro?.heading || 'Prime Design & Build project'}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
