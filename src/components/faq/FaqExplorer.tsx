'use client'

import { useId, useMemo, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { cn } from '@/lib/utils'
import type { PageFaqIndexContent } from '@/lib/pageSections'
import type { FaqIndexCategory } from '@/lib/faqIndex.server'

const ALL = '__all__'

/**
 * The FAQ page's browse-and-search index.
 *
 * Layout follows the page's own instructions: section copy, then a search
 * field, then a two-column split — categories on the left, questions on the
 * right. The left rail is a sticky list on desktop and a horizontally
 * scrollable chip row on phones.
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
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>(ALL)
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const searchId = useId()

  const trimmed = query.trim().toLowerCase()
  const isSearching = trimmed.length > 0

  const totalCount = useMemo(
    () => categories.reduce((sum, category) => sum + category.items.length, 0),
    [categories],
  )

  /** Category filter first, then the text query across question + answer. */
  const visible = useMemo(() => {
    const scoped =
      activeCategory === ALL
        ? categories
        : categories.filter((category) => category.slug === activeCategory)
    if (!isSearching) return scoped
    return scoped
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => item.searchText.includes(trimmed)),
      }))
      .filter((category) => category.items.length > 0)
  }, [categories, activeCategory, isSearching, trimmed])

  const resultCount = visible.reduce((sum, category) => sum + category.items.length, 0)

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

      {/* ---- search ---- */}
      <div className="mx-auto mt-8 max-w-2xl">
        <label htmlFor={searchId} className="sr-only">
          {content.searchPlaceholder || 'Search questions'}
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-2/40"
            aria-hidden
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={content.searchPlaceholder}
            className="w-full border border-line bg-white py-4 pl-11 pr-11 text-sm text-ink outline-none transition-colors placeholder:text-ink-2/45 focus:border-brass"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-ink-2/50 transition-colors hover:text-brass-deep"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          ) : null}
        </div>
        <p className="mt-3 text-center text-xs uppercase tracking-[0.14em] text-ink-2/45" aria-live="polite">
          {isSearching
            ? `${resultCount} of ${totalCount} question${totalCount === 1 ? '' : 's'}`
            : `${totalCount} question${totalCount === 1 ? '' : 's'} across ${categories.length} categories`}
        </p>
      </div>

      {/* ---- categories + questions ---- */}
      <div className="mt-12 grid gap-10 lg:grid-cols-[260px_1fr] lg:gap-14">
        <aside className="lg:sticky lg:top-28 lg:self-start">
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
                onClick={() => setActiveCategory(category.slug)}
              />
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          {visible.length ? (
            <div className="grid gap-10">
              {visible.map((category) => (
                <section key={category.slug} aria-labelledby={`faq-${category.slug}`}>
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
                      const open = isSearching || openItems.has(item.id)
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
                onClick={() => {
                  setQuery('')
                  setActiveCategory(ALL)
                }}
                className="mt-5 border border-line px-5 py-3 text-sm font-semibold text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
              >
                Clear filters
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
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        // Phones: chips in a scrolling row. Desktop: a bordered rail.
        'flex shrink-0 items-center gap-2 whitespace-nowrap border px-4 py-2.5 text-sm transition-colors',
        'lg:w-full lg:shrink lg:justify-between lg:whitespace-normal lg:border-0 lg:border-l-2 lg:px-4 lg:py-3 lg:text-left',
        active
          ? 'border-brass bg-brass font-semibold text-ink lg:border-l-brass lg:bg-transparent lg:text-brass-deep'
          : 'border-line text-ink-2/70 hover:border-brass hover:text-brass-deep lg:border-l-transparent lg:hover:border-l-brass/40',
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'text-xs tabular-nums',
          active ? 'text-ink/60 lg:text-brass-deep/60' : 'text-ink-2/35',
        )}
      >
        {count}
      </span>
    </button>
  )
}
