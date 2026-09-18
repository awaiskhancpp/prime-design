'use client'

import { useState } from 'react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import { GalleryGrid } from './GalleryGrid'

type GalleryTab = {
  label: string
  images: string[]
}

export function LandingGalleryTabs({
  heading,
  eyebrow,
  description,
  tabs,
  lightbox = false,
}: {
  heading?: string
  eyebrow?: string
  description?: string
  tabs: GalleryTab[]
  /** Mirrors the source HappyFiles gallery's own `lightbox` setting. */
  lightbox?: boolean
}) {
  const usableTabs = tabs.filter((tab) => tab.images.length > 0)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!usableTabs.length) return null
  const active = usableTabs[Math.min(activeIndex, usableTabs.length - 1)]

  return (
    <Section className="bg-white">
      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-10">
        {heading ? (
          <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">{heading}</h2>
        ) : null}
        {eyebrow || description ? (
          <div>
            {eyebrow ? (
              <p className="font-display text-lg font-medium text-ink">{eyebrow}</p>
            ) : null}
            {description ? (
              <p className="mt-2 text-base leading-7 text-ink-2/70">{description}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {usableTabs.length > 1 ? (
        <div
          role="tablist"
          aria-label="Gallery categories"
          className="mt-8 grid gap-3 sm:grid-cols-2"
        >
          {usableTabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              role="tab"
              aria-selected={index === activeIndex}
              onClick={() => setActiveIndex(index)}
              className={cn(
                'cursor-pointer border px-6 py-4 text-sm font-semibold transition-colors',
                index === activeIndex
                  ? 'border-brass bg-brass text-white'
                  : 'border-line bg-white text-ink-2 hover:border-brass hover:text-brass-deep',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div key={active.label} className="mt-6 animate-fade-in motion-reduce:animate-none">
        <GalleryGrid images={active.images} altPrefix={active.label} lightbox={lightbox} />
      </div>
    </Section>
  )
}
