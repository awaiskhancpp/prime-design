'use client'

import { cn } from '@/lib/utils'
import type { FaqIndexCategory } from '@/lib/faqIndex.server'

/** Shared with `FaqExplorer`, which owns the selection state this reads. */
export const ALL = '__all__'

/**
 * The category control on a phone: one native `<select>`, not the vertical
 * rail `FaqExplorer` shows from `lg`.
 *
 * A row of twelve wrapped chip buttons was tried first — it is what a phone
 * fell back to when the rail's own layout stopped fitting — and it read as a
 * wall of near-identical boxes with no current value visible at a glance and
 * nothing to say nine of the twelve ran on below the fold. A select is a
 * single control that always shows the one thing that is actually selected,
 * and it opens the OS's own picker rather than a piece of UI this site has to
 * get right for touch, which is the same reasoning behind the contact form's
 * service field (`components/forms/LeadForm.tsx`) also being a native
 * `<select>` instead of a styled listbox.
 *
 * Only the closed control is restyled — square corners and the hairline
 * border every input on this site uses, with the same brass chevron the lead
 * form's select draws from a data URI rather than an icon font, so the
 * dropdown still looks native once it is open.
 */
export function FaqCategoryPicker({
  allLabel,
  totalCount,
  categories,
  activeCategory,
  onChange,
}: {
  allLabel: string
  totalCount: number
  categories: FaqIndexCategory[]
  activeCategory: string
  onChange: (slug: string) => void
}) {
  return (
    <div className="lg:hidden">
      <label
        htmlFor="faq-category-picker"
        className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-ink-2/45"
      >
        Category
      </label>
      <div className="relative">
        <select
          id="faq-category-picker"
          value={activeCategory}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            'w-full appearance-none border border-line bg-white px-4 py-3.5 text-base font-medium text-ink-2',
            'focus:border-brass focus:outline-none',
            // Room for the chevron drawn by the background image below.
            'bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10',
          )}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%23C19A5B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
          }}
        >
          <option value={ALL}>
            {allLabel} ({totalCount})
          </option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title} ({category.items.length})
            </option>
          ))}
        </select>
        {/* The brass rule every bordered control on this site opens with
            (`PhotoPlateCard`, the FAQ rail's own left border) — a thin
            top-of-box accent, here doubling as the "this is a styled control,
            not the OS default" signal a bare border does not give. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-brass"
        />
      </div>
    </div>
  )
}
