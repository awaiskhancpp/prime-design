'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import type { GalleryCategory } from '@/lib/gallery'

const PAGE_SIZE = 12

export function GalleryTabs({ categories }: { categories: GalleryCategory[] }) {
  const tabs = useMemo(
    () => [
      { slug: 'all', title: 'All', images: categories.flatMap((category) => category.images) },
      ...categories,
    ],
    [categories],
  )

  const [activeSlug, setActiveSlug] = useState(tabs[0].slug)
  const [page, setPage] = useState(1)

  const activeTab = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0]
  const totalPages = Math.max(1, Math.ceil(activeTab.images.length / PAGE_SIZE))
  const pageImages = activeTab.images.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function selectTab(slug: string) {
    setActiveSlug(slug)
    setPage(1)
  }

  return (
    <Section className="bg-white">
      {/* Category tabs — same uppercase/tracked-out eyebrow language and
          brass underline used across the rest of the site, not a new pill
          or rounded-tab pattern. */}
      <div
        role="tablist"
        aria-label="Gallery categories"
        className="flex flex-wrap justify-center gap-x-8 gap-y-3 border-b border-line"
      >
        {tabs.map((tab) => (
          <button
            key={tab.slug}
            type="button"
            role="tab"
            aria-selected={tab.slug === activeSlug}
            onClick={() => selectTab(tab.slug)}
            className={cn(
              'relative cursor-pointer pb-4 text-xs font-semibold uppercase tracking-[0.16em] transition-colors',
              tab.slug === activeSlug ? 'text-ink-2' : 'text-ink-2/45 hover:text-ink-2/75',
            )}
          >
            {tab.title}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-0 -bottom-px h-0.5 bg-brass transition-opacity duration-200',
                tab.slug === activeSlug ? 'opacity-100' : 'opacity-0',
              )}
            />
          </button>
        ))}
      </div>

      {/* Image grid — identical treatment to GallerySection: sharp corners,
          hairline gap, 4:3 crop, subtle hover zoom. */}
      <div
        key={`${activeTab.slug}-${page}`}
        className="mt-10 grid animate-fade-in grid-cols-2 gap-1 motion-reduce:animate-none md:grid-cols-3"
      >
        {pageImages.map((image, index) => (
          <div
            key={`${activeTab.slug}-${(page - 1) * PAGE_SIZE + index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${activeTab.title} project photo ${index + 1}`}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 ease-out hover:scale-105"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>

      {totalPages > 1 ? (
        <nav
          aria-label="Gallery pagination"
          className="mt-10 flex items-center justify-center gap-2"
        >
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="flex h-9 w-9 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setPage(num)}
              aria-current={num === page ? 'page' : undefined}
              className={cn(
                'flex h-9 w-9 items-center justify-center border text-sm transition-colors',
                num === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-line text-ink-2 hover:border-brass hover:text-brass-deep',
              )}
            >
              {num}
            </button>
          ))}

          <button
            type="button"
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="flex h-9 w-9 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      ) : null}
    </Section>
  )
}
