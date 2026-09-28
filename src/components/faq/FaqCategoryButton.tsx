'use client'

import { cn } from '@/lib/utils'

/**
 * One row in the desktop category rail (`FaqExplorer`, from `lg`).
 *
 * Below `lg` the same choice is a native `<select>` (`FaqCategoryPicker`),
 * not this component: a wrapped row of these as chip buttons was the design
 * before, and on a phone twelve near-identical bordered boxes read as a wall
 * with no sense of how many more ran on below the fold, or which one was
 * actually selected without reading each one in turn.
 *
 * `font-medium` on every state, never only on the active or current one: a
 * weight change alters the label's measured width, which can tip it onto a
 * second line and change the rail's height — the exact reflow this rail must
 * not have. Selection and position are shown with colour and the left border
 * instead.
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
        'flex w-full min-w-[13rem] items-center justify-between gap-4 border-0 border-l-2 px-4 py-3 text-left text-sm font-medium transition-colors duration-300',
        active
          ? 'border-l-brass bg-transparent text-brass-deep'
          : current
            ? // Scrolled into view: brass, but lighter than the selected
              // state so the two are never confused for each other.
              'border-l-brass/70 text-brass-deep'
            : 'border-l-transparent text-ink-2/70 hover:border-l-brass/40 hover:text-brass-deep',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-xs tabular-nums transition-colors duration-300',
          active ? 'text-brass-deep/60' : current ? 'text-brass-deep/60' : 'text-ink-2/35',
        )}
      >
        {count}
      </span>
    </button>
  )
}
