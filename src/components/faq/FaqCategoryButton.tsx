'use client'

import { cn } from '@/lib/utils'

/**
 * The category control shared by the FAQ page's browse index and the landing
 * pages' FAQ section.
 *
 * Chips in a scrolling row on phones, a bordered rail on desktop. It lives
 * here rather than inside `FaqExplorer` because the landing section now wears
 * the same design, and two copies of a control this particular is how the two
 * drift apart.
 */
export function FaqCategoryButton({
  label,
  count,
  active,
  current = false,
  onClick,
}: {
  label: string
  count: number
  /** This category is the selected filter. */
  active: boolean
  /** Its questions are under the top of the viewport (All view only). */
  current?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-current={current ? 'true' : undefined}
      className={cn(
        // Phones: chips in a scrolling row. Desktop: a bordered rail.
        // `font-medium` on every state, never only on the active or current
        // one: a weight change alters the label's measured width, which can
        // tip it onto a second line and change the rail's height — the exact
        // reflow this rail must not have. Selection and position are shown
        // with colour and the left border instead.
        'flex shrink-0 items-center gap-2 whitespace-nowrap border px-4 py-2.5 text-sm font-medium transition-colors duration-300',
        'lg:w-full lg:min-w-[13rem] lg:shrink lg:justify-between lg:whitespace-normal lg:border-0 lg:border-l-2 lg:px-4 lg:py-3 lg:text-left',
        active
          ? 'border-brass bg-brass text-ink lg:border-l-brass lg:bg-transparent lg:text-brass-deep'
          : current
            ? // Scrolled into view: brass, but lighter than the selected
              // state so the two are never confused for each other.
              'border-brass/40 text-brass-deep lg:border-l-brass/70'
            : 'border-line text-ink-2/70 hover:border-brass hover:text-brass-deep lg:border-l-transparent lg:hover:border-l-brass/40',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-xs tabular-nums transition-colors duration-300',
          active
            ? 'text-ink/60 lg:text-brass-deep/60'
            : current
              ? 'text-brass-deep/60'
              : 'text-ink-2/35',
        )}
      >
        {count}
      </span>
    </button>
  )
}
