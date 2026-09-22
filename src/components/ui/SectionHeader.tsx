import type { ReactNode } from 'react'

import { HighlightedText } from '@/components/ui/HighlightedText'
import { cn } from '@/lib/utils'

/**
 * The one section header for the whole site.
 *
 * Before this, 64 components rendered their own `<h2>`, which is why section
 * headings had drifted into five heading sizes and six different eyebrow
 * treatments. The tokens below are the majority spellings from that audit, so
 * adopting this changes as few sections visually as possible:
 *
 *   eyebrow      text-xs uppercase tracking-[0.2em] text-brass-deep   (42 of 67 uses)
 *   heading      font-display text-3xl md:text-4xl                    (the two most common sizes)
 *   description  text-base leading-[1.7] text-ink-2/70
 *
 * Variety is deliberate but bounded. A section picks from this ladder — it
 * does not invent a size — and the ladder is short enough that the whole site
 * still reads as one typographic system:
 *
 *   size="sm"   compact headers: a form's own title, a card-sized callout,
 *               a sub-header inside a section that already has a heading
 *   size="md"   (default) the ordinary in-page section
 *   size="lg"   the bigger set pieces — full-width bands, CTAs, the sections
 *               a page is built around
 *   size="xl"   the one editorial statement on a page (the testimonials
 *               spotlight, the projects intro, the team intro). Reserved:
 *               a page that uses it more than once has no set piece at all.
 *
 *   align="left"   (default)
 *   align="center" full-width moments — galleries, quotes, CTA bands
 *
 *   tone="ink"   (default) headers on paper or white
 *   tone="light" headers on the ink and brass bands, where the heading is
 *                white and the eyebrow has to lift off the dark ground
 *
 * `titleHighlight` is the WordPress `heading--gradient` pattern: the named
 * phrases render in brass (or, on a dark band, in the paper tint that reads
 * as the brass accent does on white).
 */
export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  align = 'left',
  size = 'md',
  tone = 'ink',
  className,
}: {
  eyebrow?: ReactNode
  title: ReactNode
  /** Phrases within `title` to set in brass, separated by `|`. */
  titleHighlight?: string | null
  description?: ReactNode
  align?: 'left' | 'center'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  tone?: 'ink' | 'light'
  className?: string
}) {
  const light = tone === 'light'

  // Highlighting can only be applied to plain text; a caller that passes its
  // own nodes has already decided how the title renders.
  const heading =
    typeof title === 'string' && titleHighlight ? (
      <HighlightedText
        text={title}
        highlight={titleHighlight}
        className={light ? 'text-brass' : undefined}
      />
    ) : (
      title
    )

  return (
    <div
      className={cn(
        'max-w-2xl space-y-4',
        size === 'xl' && 'max-w-3xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.2em]',
            light ? 'text-brass' : 'text-brass-deep',
          )}
        >
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={cn(
          'font-display font-medium leading-tight tracking-tight',
          light ? 'text-white' : 'text-ink-2',
          size === 'sm' && 'text-2xl md:text-3xl',
          size === 'md' && 'text-3xl md:text-4xl',
          size === 'lg' && 'text-4xl md:text-5xl',
          size === 'xl' && 'text-4xl leading-[1.05] md:text-6xl',
        )}
      >
        {heading}
      </h2>

      {description ? (
        <div
          className={cn(
            'text-base leading-[1.7]',
            light ? 'text-white/75' : 'text-ink-2/70',
            align === 'left' && 'max-w-xl',
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  )
}
