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
 * Variety is deliberate but bounded — two sizes and two alignments, not a
 * free-for-all:
 *
 *   size="md"   (default) in-page sections
 *   size="lg"   the bigger set pieces that already ran larger
 *   align="left"   (default)
 *   align="center" full-width moments — galleries, quotes, CTA bands
 *
 * `titleHighlight` is the WordPress `heading--gradient` pattern: the named
 * phrases render in brass. It used to be available on heroes only.
 */
export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  align = 'left',
  size = 'md',
  className,
}: {
  eyebrow?: string
  title: ReactNode
  /** Phrases within `title` to set in brass, separated by `|`. */
  titleHighlight?: string | null
  description?: ReactNode
  align?: 'left' | 'center'
  size?: 'md' | 'lg'
  className?: string
}) {
  // Highlighting can only be applied to plain text; a caller that passes its
  // own nodes has already decided how the title renders.
  const heading =
    typeof title === 'string' && titleHighlight ? (
      <HighlightedText text={title} highlight={titleHighlight} />
    ) : (
      title
    )

  return (
    <div
      className={cn(
        'max-w-2xl space-y-4',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {eyebrow}
        </p>
      ) : null}

      <h2
        className={cn(
          'font-display font-medium leading-tight tracking-tight text-ink-2',
          size === 'lg' ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl',
        )}
      >
        {heading}
      </h2>

      {description ? (
        <div className={cn('text-base leading-[1.7] text-ink-2/70', align === 'left' && 'max-w-xl')}>
          {description}
        </div>
      ) : null}
    </div>
  )
}
