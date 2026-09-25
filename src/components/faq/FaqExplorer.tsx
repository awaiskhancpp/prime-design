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
 * Hold `element` at the same point on the screen while the layout around it
 * changes.
 *
 * The panel opens over a 300ms `grid-template-rows` transition, so the
 * growth arrives a frame at a time rather than all at once — correcting the
 * scroll position once, up front, would make the question jump and then
 * drift. This watches the element for the length of the transition and
 * takes the difference out of the scroll position on every frame, so the
 * question sits still and the answer appears to unfold beneath it.
 *
 * At the very bottom of the page there is nothing left to scroll, so the
 * last question can still shift; the browser has no more room to give.
 */
function anchor(element: HTMLElement, top: number) {
  const started = performance.now()
  const step = () => {
    const delta = element.getBoundingClientRect().top - top
    if (Math.abs(delta) > 0.5) window.scrollBy(0, delta)
    // A little past the 300ms transition, to catch the final frame.
    if (performance.now() - started < 400) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

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
   * One answer at a time, and the question you press does not move.
   *
   * Opening an answer used to grow the page under the reader: one question
   * pushed everything below it down 136px, two by 300px, and the "Areas we
   * service" section moved with them. The first fix for that reserved the
   * tallest answer's worth of space at the foot of the list and gave it back
   * as an answer opened, so the page height never changed at all.
   *
   * That reserve is gone, because its cost was worse than the problem. It is
   * sized by the single tallest answer — the ten-step "typical stages of a
   * kitchen remodel" list — while the median answer is a fifth of that, so
   * every reader paid for the outlier on every scroll: 520px of empty space
   * under the last question on a desktop, and 912px on a phone, which is more
   * than a whole viewport of nothing. The last question never reached the
   * bottom of the page.
   *
   * What holds the page steady now is `anchor` below: the question you press
   * stays at exactly the same point on the screen while its answer opens
   * underneath it, and so does everything above it. What changes is that
   * content *below* the open question now moves down, as an accordion's does.
   */
  const [openItem, setOpenItem] = useState<string | null>(null)
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

  const toggle = (id: string, element?: HTMLElement | null) => {
    const top = element?.getBoundingClientRect().top
    setOpenItem((current) => (current === id ? null : id))
    if (element && top !== undefined) anchor(element, top)
  }

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
                      const open = openItem === item.id
                      return (
                        <li key={item.id}>
                          <h4>
                            <button
                              type="button"
                              onClick={(event) => toggle(item.id, event.currentTarget)}
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
                              so the answer has a height to animate between
                              instead of appearing all at once. `inert` keeps
                              a closed answer out of the tab order and away
                              from screen readers, which `display: none` used
                              to do for free. */}
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
