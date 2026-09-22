import { Star } from 'lucide-react'
import Image from '@/components/ui/Image'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export type TrustIntroStat = {
  value?: string | null
  label?: string | null
  /** Renders five stars above the value (used for the rating block). */
  showStars?: boolean | null
}

export type TrustIntroButton = {
  label: string
  url: string
  variant?: 'outline' | 'brass' | string | null
}

export type TrustIntroContent = {
  eyebrow?: string | null
  heading?: string | null
  body?: string | null
  image?: string | null
  stats?: TrustIntroStat[]
  buttons?: TrustIntroButton[]
}

/**
 * The trust section ("Silicon Valley loves working with us!") — the design
 * first built for the Projects page, reused on the service pages in place of
 * the old Silicon Valley Loves layout.
 *
 * Every value comes from Payload (a service's "Silicon Valley Loves" group,
 * or the Site Settings trust section on the Projects page) — there is no
 * hardcoded copy, image or stat here.
 */
export function ProjectsTrustIntro({
  eyebrow,
  heading,
  body,
  image,
  stats,
  buttons,
}: TrustIntroContent) {
  const shownStats = (stats ?? []).filter((stat) => stat?.value || stat?.label)
  const shownButtons = (buttons ?? []).filter((button) => button?.label && button?.url)

  // Content comes from Payload only — render nothing without it.
  if (!heading && !body) return null

  return (
    <Section className="bg-white">
      <div className="grid gap-16 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-4 max-w-2xl font-display text-5xl font-medium leading-[0.98] tracking-tight text-ink md:text-7xl">
              {heading}
            </h2>
          ) : null}
          {body ? <p className="mt-8 max-w-xl text-lg leading-8 text-ink-2/75">{body}</p> : null}

          {shownButtons.length ? (
            <div className="mt-9 flex flex-wrap gap-4">
              {shownButtons.map((button) => (
                <Button
                  key={`${button.label}-${button.url}`}
                  href={button.url}
                  variant={button.variant === 'brass' ? 'primary' : 'outline'}
                  size="lg"
                  className={
                    button.variant === 'brass'
                      ? 'border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white'
                      : undefined
                  }
                >
                  {button.label} <span aria-hidden>→</span>
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Offset brass frame (same motif as the project-detail hero) with the
            trust stats as a small floating card anchored to one corner. */}
        <div className="relative mb-8 sm:mb-10">
          {image ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
              <Image
                src={image}
                alt={heading || 'Prime Design & Build'}
                fill
                className="object-cover"
              />
            </div>
          ) : null}

          {shownStats.length ? (
            <div className="absolute -bottom-6 left-6 flex items-center gap-5 border border-line bg-white px-6 py-5 shadow-xl sm:-bottom-8 sm:left-8">
              {shownStats.map((stat, index) => (
                <div
                  key={`${stat.value}-${stat.label}-${index}`}
                  className="flex items-center gap-5"
                >
                  {index > 0 ? <div className="h-10 w-px bg-line" aria-hidden="true" /> : null}
                  <div>
                    {stat.showStars ? (
                      <span className="flex items-center gap-0.5 text-brass" aria-hidden="true">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} className="h-3.5 w-3.5 fill-current" />
                        ))}
                      </span>
                    ) : null}
                    {stat.value ? (
                      <p className="mt-1 font-display text-3xl font-medium leading-none text-ink">
                        {stat.value}
                      </p>
                    ) : null}
                    {stat.label ? (
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-2/60">
                        {stat.label}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
