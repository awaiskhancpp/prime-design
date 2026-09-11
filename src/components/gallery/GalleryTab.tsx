'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import type { GalleryCategory } from '@/lib/gallery'

import { Lightbox } from './Lightbox'

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
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const activeTab = tabs.find((tab) => tab.slug === activeSlug) ?? tabs[0]
  const visibleImages = activeTab.images.slice(0, visibleCount)
  const hasMore = visibleCount < activeTab.images.length

  function selectTab(slug: string) {
    setActiveSlug(slug)
    setVisibleCount(PAGE_SIZE)
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
          hairline gap, 4:3 crop, subtle hover zoom. Clicking a photo opens
          the lightbox at that image's position in the FULL active-tab list
          (not just the currently loaded subset), so once open you can
          browse the whole category, not just what "Load More" has
          revealed so far. */}
      <div
        key={activeTab.slug}
        className="mt-10 grid animate-fade-in grid-cols-2 gap-1 motion-reduce:animate-none md:grid-cols-3"
      >
        {visibleImages.map((image, index) => (
          <button
            key={`${activeTab.slug}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className="group relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${activeTab.title} project photo ${index + 1}`}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(min-width: 768px) 33vw, 50vw"
            />
          </button>
        ))}
      </div>

      {hasMore ? (
        <div className="mt-10 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            className="border border-line px-8 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            Load more
          </button>
        </div>
      ) : null}

      {lightboxIndex !== null ? (
        <Lightbox
          images={activeTab.images}
          index={lightboxIndex}
          alt={activeTab.title}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      ) : null}
    </Section>
  )
}
