'use client'

import { useId, useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { FaqCategoryButton } from '@/components/faq/FaqCategoryButton'
import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

type FaqItem = { question: string; answer: string }
type FaqCategory = { title: string; items: FaqItem[] }

const ALL = '__all__'

/**
 * The landing pages' FAQ, wearing the FAQ page's design.
 *
 * Centred copy, a count line, then a two-column split: the category rail on
 * the left — a scrolling chip row on phones, a bordered sticky list on
 * desktop — and the questions on the right, grouped under their category with
 * a count beside each heading. The rail control is `FaqCategoryButton`, the
 * same component `FaqExplorer` uses, so the two are one implementation rather
 * than two that resemble each other.
 *
 * ── What the content is ───────────────────────────────────────────────────
 *
 *   questions   37–103 characters
 *   answers     278–902 characters, plain strings with no paragraph breaks
 *   categories  1 to 4 per page, holding 2 to 5 questions each
 *
 * The rail and the "All" option only appear with more than one category: one
 * page has a single category, and a rail offering a choice between one thing
 * and all of that thing is a control that cannot do anything. That page gets
 * the questions at full width instead.
 *
 * Answers are plain strings here, where the FAQ page's are rich text, so this
 * renders a paragraph rather than `RichTextContent` — the typography is the
 * same either way.
 *
 * Several answers can be open at once, as on the FAQ page. The previous
 * single-open accordion meant that reading a second question closed the first,
 * which on a page being scanned for objections is the wrong way round.
 */
export function LandingFaqSection({
  heading,
  description,
  items = [],
  categories = [],
}: {
  heading?: string
  description?: string
  items?: FaqItem[]
  categories?: FaqCategory[]
}) {
  const baseId = useId()
  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  // A block with no categories still arrives with loose items; give them one
  // unnamed group so the rest of the component has a single shape to render.
  const groups = useMemo<FaqCategory[]>(
    () => (categories.length ? categories : items.length ? [{ title: '', items }] : []),
    [categories, items],
  )

  const totalCount = useMemo(
    () => groups.reduce((sum, group) => sum + group.items.length, 0),
    [groups],
  )

  const showRail = groups.length > 1
  const visible = useMemo(
    () =>
      !showRail || activeCategory === ALL
        ? groups
        : groups.filter((group) => group.title === activeCategory),
    [groups, activeCategory, showRail],
  )

  const toggle = (id: string) =>
    setOpenItems((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (!totalCount) return null

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-2xl text-center">
        {heading ? (
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-ink-2 md:text-4xl">
            {heading}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-4 text-base leading-7 text-ink-2/70">{description}</p>
        ) : null}
      </div>

      {showRail ? (
        <p className="mx-auto mt-6 max-w-2xl text-center text-xs uppercase tracking-[0.14em] text-ink-2/45">
          {`${totalCount} question${totalCount === 1 ? '' : 's'} across ${groups.length} categories`}
        </p>
      ) : null}

      <div
        className={cn(
          'mt-12 grid gap-10',
          showRail ? 'lg:grid-cols-[260px_1fr] lg:gap-14' : 'mx-auto max-w-3xl',
        )}
      >
        {showRail ? (
          // `self-start` so the rail keeps its own height instead of
          // stretching with the answers column each time one opens.
          <aside className="self-start lg:sticky lg:top-28">
            <p className="mb-4 hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-2/45 lg:block">
              Categories
            </p>
            <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-line lg:px-0 lg:pb-0">
              <FaqCategoryButton
                label="All questions"
                count={totalCount}
                active={activeCategory === ALL}
                onClick={() => setActiveCategory(ALL)}
              />
              {groups.map((group) => (
                <FaqCategoryButton
                  key={group.title}
                  label={group.title}
                  count={group.items.length}
                  active={activeCategory === group.title}
                  onClick={() => setActiveCategory(group.title)}
                />
              ))}
            </div>
          </aside>
        ) : null}

        <div className="min-w-0">
          <div className="grid gap-10">
            {visible.map((group, groupIndex) => (
              <section
                key={group.title || groupIndex}
                aria-labelledby={group.title ? `${baseId}-${groupIndex}` : undefined}
              >
                {group.title ? (
                  <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <h3
                      id={`${baseId}-${groupIndex}`}
                      className="font-display text-xl font-medium text-ink-2 md:text-2xl"
                    >
                      {group.title}
                    </h3>
                    <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-ink-2/40">
                      {group.items.length}
                    </span>
                  </div>
                ) : null}

                <ul className={cn('divide-y divide-line', !group.title && 'border-t border-line')}>
                  {group.items.map((item, itemIndex) => {
                    const id = `${groupIndex}-${itemIndex}`
                    const open = openItems.has(id)
                    return (
                      <li key={item.question}>
                        <h4>
                          <button
                            type="button"
                            onClick={() => toggle(id)}
                            aria-expanded={open}
                            aria-controls={`${baseId}-panel-${id}`}
                            className="group flex w-full items-start justify-between gap-5 py-5 text-left"
                          >
                            <span className="text-base font-medium leading-6 text-ink-2 transition-colors group-hover:text-brass-deep">
                              {item.question}
                            </span>
                            <span
                              className={cn(
                                'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-line text-ink-2/60 transition-all duration-200',
                                open && 'rotate-180 border-brass bg-brass text-ink',
                              )}
                              aria-hidden
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        </h4>
                        <div
                          id={`${baseId}-panel-${id}`}
                          hidden={!open}
                          className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-ink-2/75"
                        >
                          <p>{item.answer}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
