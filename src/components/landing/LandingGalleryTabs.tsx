'use client'

import { useId, useState } from 'react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { tabPanelProps, tabProps } from '@/lib/tabs'
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
  const tabsId = useId()

  if (!usableTabs.length) return null
  const active = usableTabs[Math.min(activeIndex, usableTabs.length - 1)]

  return (
    <Section className="bg-white">
      {heading || eyebrow || description ? (
        <SectionHeader eyebrow={eyebrow} title={heading} description={description} />
      ) : null}

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
              {...tabProps(tabsId, index, index === activeIndex)}
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

      <div
        key={active.label}
        // A tab panel only while there are tabs to label it.
        {...(usableTabs.length > 1 ? tabPanelProps(tabsId, activeIndex) : {})}
        className="mt-6 animate-fade-in motion-reduce:animate-none"
      >
        <GalleryGrid images={active.images} altPrefix={active.label} lightbox={lightbox} />
      </div>
    </Section>
  )
}
