'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { cn } from '@/lib/utils'
import { FaqCategoryButton } from './FaqCategoryButton'
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
  /**
   * One answer at a time, and space reserved for it.
   *
   * Opening an answer used to grow the page under the reader: one question
   * pushed everything below it down 136px, two by 300px, and the "Areas we
   * service" section moved with them. Two changes together stop that. Only
   * one answer can be open, so the column can only ever grow by one answer's
   * height; and `reserve` below holds exactly that much space at the foot of
   * the list, so the growth is absorbed instead of added. The page is the
   * same height whichever question is open, and whether any is.
   */
  const [openItem, setOpenItem] = useState<string | null>(null)
  /** Every answer's height while closed, keyed by id, measured from the page. */
  const [answerHeights, setAnswerHeights] = useState<Record<string, number>>({})
  const listRef = useRef<HTMLDivElement>(null)
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
    // No `setCurrentCategory(null)` here: a synchronous setState in an effect
    // body triggers a cascading render, and it was redundant anyway — the
    // rail already gates the indicator on `activeCategory === ALL`, so a
    // stale value is never read. The observer below re-runs and refreshes it
    // whenever the view returns to All.
    if (activeCategory !== ALL) return
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
  }, [activeCategory, visible, openItem])

  const toggle = (id: string) => setOpenItem((current) => (current === id ? null : id))

  const tallestAnswer = Math.max(0, ...Object.values(answerHeights))
  const openHeight = openItem ? (answerHeights[openItem] ?? 0) : 0
  const reservePx = Math.max(0, tallestAnswer - openHeight)

  /**
   * The tallest answer, measured from the page itself.
   *
   * Every panel stays in the DOM and is collapsed with a `0fr` grid row
   * rather than `hidden`, so its content still has a real height to measure
   * while closed. Re-measured when the visible set changes (filtering by
   * category changes which answers are on the page) and on resize, because
   * an answer's height depends on the column width.
   */
  useEffect(() => {
    const element = listRef.current
    if (!element) return

    const measure = () => {
      const panels = element.querySelectorAll<HTMLElement>('[data-faq-answer]')
      const next: Record<string, number> = {}
      for (const panel of panels) {
        const id = panel.dataset.faqId
        if (id) next[id] = panel.scrollHeight
      }
      setAnswerHeights((previous) => {
        const same =
          Object.keys(next).length === Object.keys(previous).length &&
          Object.entries(next).every(([id, height]) => previous[id] === height)
        return same ? previous : next
      })
    }

    // On the next frame, not in the effect body: the rule this project lints
    // with rejects a synchronous setState in an effect, and the panels need a
    // paint before their heights are real.
    const frame = requestAnimationFrame(measure)
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [visible])

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
        {/* `min-w-0`: a grid item defaults to `min-width: auto`, which means
            it refuses to shrink below its content. The chip row below is a
            horizontal strip of 12 category buttons, so without this the
            column grew to the full 3,579px of that strip and took the whole
            page with it — /faq scrolled sideways by 3,189px on a phone. */}
        <aside className="min-w-0 self-start lg:sticky lg:top-28">
          <p className="mb-4 hidden text-xs font-semibold uppercase tracking-[0.18em] text-ink-2/45 lg:block">
            Categories
          </p>
          {/* Wrapped, not scrolled. A sideways strip hides most of the
              categories behind a gesture with nothing to indicate they are
              there; wrapped, all twelve are on screen at once, which is what
              the owner asked for on the landing pages' FAQ for the same
              reason. From `lg` it becomes the vertical rail again. */}
          <div className="flex flex-wrap gap-2 pb-2 lg:flex-col lg:flex-nowrap lg:gap-0 lg:border-l lg:border-line lg:pb-0">
            <FaqCategoryButton
              label={content.allLabel || 'All questions'}
              count={totalCount}
              active={activeCategory === ALL}
              onClick={() => setActiveCategory(ALL)}
            />
            {categories.map((category) => (
              <FaqCategoryButton
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

        {/* The reserve shrinks by exactly as much as the open answer adds:
            padding = tallest − open. Closed, the column carries the tallest
            answer's worth of space; open, that space becomes the answer. The
            sum is constant, so nothing below the list moves. */}
        <div className="min-w-0" ref={listRef} style={{ paddingBottom: reservePx }}>
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
                      const open = openItem === item.id
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
                          {/* Collapsed with a grid row rather than `hidden`,
                              so the answer keeps a measurable height while
                              closed — that is what `reserve` is measured
                              from. `inert` keeps a closed answer out of the
                              tab order and away from screen readers, which
                              `display: none` used to do for free. */}
                          <div
                            className={cn(
                              'grid transition-[grid-template-rows] duration-300 ease-out',
                              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                            )}
                          >
                            <div className="overflow-hidden">
                              <div
                                id={`faq-panel-${item.id}`}
                                data-faq-answer
                                data-faq-id={item.id}
                                // React 19 passes `inert` through as a real
                                // boolean; the string form it replaced made
                                // React warn on every render.
                                inert={!open}
                                aria-hidden={!open}
                                className="max-w-3xl pb-6 pr-8 text-sm leading-7 text-ink-2/75 [&_p]:mt-0 [&_p+p]:mt-4"
                              >
                                <RichTextContent data={item.answer} />
                              </div>
                            </div>
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
