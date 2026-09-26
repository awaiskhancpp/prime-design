import { Home } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

/** Every string comes from the `luxury-cta` block; no default copy. */
export function LandingLuxuryCta({
  eyebrow,
  heading,
  body,
  link,
  label,
}: {
  eyebrow?: string
  heading?: string
  body?: string
  link?: string
  label?: string
}) {
  return (
    <Section className="bg-brass-light text-ink">
      <div className="grid gap-8 md:grid-cols-2 md:items-center">
        <div>
          {eyebrow ? (
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              {/* `shrink-0` because the eyebrow is a flex row: a question long
                  enough to wrap on a phone was squeezing the icon narrower
                  than it is tall. It also steps up a size on the way down —
                  on a phone this is the only graphic in the band, and a 16px
                  outline glyph beside 12px caps read as an afterthought. */}
              <Home className="h-5 w-5 shrink-0 md:h-4 md:w-4" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight md:text-5xl">
              {heading}
            </h2>
          ) : null}
          {label && link ? (
            <Button
              href={link}
              variant="primary"
              className="mt-6 bg-ink text-white hover:bg-ink-2"
            >
              {label} →
            </Button>
          ) : null}
        </div>
        {body ? <p className="text-base leading-7">{body}</p> : null}
      </div>
    </Section>
  )
}
