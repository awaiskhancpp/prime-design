'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { cn } from '@/lib/utils'
import type { PageFaqIndexContent } from '@/lib/pageSections'
import type { FaqIndexCategory } from '@/lib/faqIndex.server'

const ALL = '__all__'

/**
 * The FAQ page's browse index.
 *
 * Section copy, then a two-column split — categories on the left, questions
 * on the right. The left rail is a sticky list on desktop and a horizontally
 * scrollable chip row on phones.
 *
 * While "All questions" is selected every category is on the page at once, so
 * the rail doubles as a position indicator: the category whose questions are
 * currently under the top of the viewport is marked as current. That is a
 * separate state from `active` (the selected filter) — with a single category
 * selected there is only one section on screen and nothing to indicate.
 *
 * All copy arrives from the `faq-index` block and all questions from the FAQs
 * collection; nothing here has a hardcoded fallback, so an empty CMS field
 * renders empty.
 */
export function FaqExplorer({
  content,
  categories,
}: {
  content: PageFaqIndexContent
  categories: FaqIndexCategory[]
}) {
  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  /** The category currently under the top of the viewport (All view only). */
  const [currentCategory, setCurrentCategory] = useState<string | null>(null)
  const sectionRefs = useRef(new Map<string, HTMLElement>())

  const totalCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.items.length, 0),
    [categories],
  )

  const visible = useMemo(
    () =>
      activeCategory === ALL
        ? categories
        : categories.filter((category) => category.slug === activeCategory),
    [categories, activeCategory],
  )

  const registerSection = useCallback((slug: string, node: HTMLElement | null) => {
    if (node) sectionRefs.current.set(slug, node)
    else sectionRefs.current.delete(slug)
  }, [])

  /**
   * Mark the category under the top of the viewport while every category is
   * on the page. The observer is keyed to a thin band near the top rather
   * than the whole viewport, so the current category changes as a heading
   * passes the top edge, not whenever any part of a section is visible.
   *
   * Re-created when the visible set changes, because opening an answer moves
   * every later section and the observer must be watching the current nodes.
   */
  useEffect(() => {
    if (activeCategory !== ALL) {
      setCurrentCategory(null)
      return
    }
    const nodes = [...sectionRefs.current.entries()]
    if (!nodes.length || typeof IntersectionObserver === 'undefined') return

    const intersecting = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const slug = entry.target.getAttribute('data-category') || ''
          if (entry.isIntersecting) intersecting.add(slug)
          else intersecting.delete(slug)
        }
        // Document order decides, so scrolling up and down agree.
        const first = visible.find((category) => intersecting.has(category.slug))
        if (first) setCurrentCategory(first.slug)
      },
      { rootMargin: '-96px 0px -65% 0px', threshold: 0 },
    )
    for (const [, node] of nodes) observer.observe(node)
    return () => observer.disconnect()
  }, [activeCategory, visible, openItems])

  const toggle = (id: string) =>
    setOpenItems((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  if (!categories.length) return null

  return (
    <Section className="bg-white">
      {/* ---- section copy ---- */}
      <div className="mx-auto max-w-2xl text-center">
        {content.eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {content.eyebrow}
          </p>
        ) : null}
        {content.heading ? (
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight text-ink-2 md:text-4xl">
            {content.heading}
          </h2>
        ) : null}
        {content.description ? (
          <p className="mt-4 text-base leading-7 text-ink-2/70">{content.description}</p>
        ) : null}
      </div>

      <p className="mx-auto mt-6 max-w-2xl text-center text-xs uppercase tracking-[0.14em] text-ink-2/45">
        {`${totalCount} question${totalCount === 1 ? '' : 's'} across ${categories.length} categories`}
      </p>

      {/* ---- categories + questions ---- */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        {/* `self-start` at every breakpoint, not just `lg`: a grid item
            stretches to the row height by default, which tied this rail's
            height to the answers column and made it grow each time an answer
            opened. No max-height here — the rail is left at its natural
            height rather than given a scrollbar of its own. */}
        <aside className="self-start lg:sticky lg:top-28">
          <p className="mb-4 hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-2/45 lg:block">
            Categories
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0 lg:border-l lg:border-line">
            <CategoryButton
              label={content.allLabel || 'All questions'}
              count={totalCount}
              active={activeCategory === ALL}
              onClick={() => setActiveCategory(ALL)}
            />
            {categories.map((category) => (
              <CategoryButton
                key={category.slug}
                label={category.title}
                count={category.items.length}
                active={activeCategory === category.slug}
                current={activeCategory === ALL && currentCategory === category.slug}
                onClick={() => setActiveCategory(category.slug)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {visible.length ? (
            <div className="grid gap-10">
              {visible.map((category) => (
                <section
                  key={category.slug}
                  data-category={category.slug}
                  ref={(node) => registerSection(category.slug, node)}
                  aria-labelledby={`faq-${category.slug}`}
                >
                  <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <h3
                      id={`faq-${category.slug}`}
                      className="font-display text-xl font-medium text-ink-2 md:text-2xl"
                    >
                      {category.title}
                    </h3>
                    <span className="shrink-0 text-xs uppercase tracking-[0.14em] text-ink-2/40">
                      {category.items.length}
                    </span>
                  </div>

                  <ul className="divide-y divide-line">
                    {category.items.map((item) => {
                      const open = openItems.has(item.id)
                      return (
                        <li key={item.id}>
                          <h4>
                            <button
                              type="button"
                              onClick={() => toggle(item.id)}
                              aria-expanded={open}
                              aria-controls={`faq-panel-${item.id}`}
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
                            id={`faq-panel-${item.id}`}
                            hidden={!open}
                            className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-ink-2/75 [&_p]:mt-0 [&_p+p]:mt-4"
                          >
                            <RichTextContent data={item.answer} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <div className="border border-line bg-paper px-6 py-16 text-center">
              <p className="font-display text-xl text-ink-2">{content.emptyMessage}</p>
              <button
                type="button"
                onClick={() => setActiveCategory(ALL)}
                className="mt-5 border border-line px-5 py-3 text-sm font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
              >
                Show all questions
              </button>
            </div>
          )}
        </div>
      </div>
    </Section>
  )
}

function CategoryButton({
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
