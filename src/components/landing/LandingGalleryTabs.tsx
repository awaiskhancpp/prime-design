'use client'

import { useState } from 'react'
import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'

type GalleryTab = {
  label: string
  images: string[]
}

export function LandingGalleryTabs({
  heading,
  description,
  tabs,
}: {
  heading?: string
  description?: string
  tabs: GalleryTab[]
}) {
  const usableTabs = tabs.filter((tab) => tab.images.length > 0)
  const [activeIndex, setActiveIndex] = useState(0)

  if (!usableTabs.length) return null
  const active = usableTabs[Math.min(activeIndex, usableTabs.length - 1)]

  return (
    <Section className="bg-white">
      <div className="grid gap-6 md:grid-cols-2 md:items-start md:gap-10">
        <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
          {heading || 'A reflection of our remodeling projects in Silicon Valley'}
        </h2>
        {description ? (
          <div>
            <p className="font-display text-lg font-medium text-ink">Our Gallery</p>
            <p className="mt-2 text-base leading-7 text-ink-2/70">{description}</p>
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

      <div
        key={active.label}
        className="mt-6 grid animate-fade-in grid-cols-2 gap-3 motion-reduce:animate-none md:grid-cols-3"
      >
        {active.images.map((image, index) => (
          <div
            key={`${active.label}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${active.label} photo ${index + 1}`}
              fill
              loading="lazy"
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, 50vw"
            />
          </div>
        ))}
      </div>
    </Section>
  )
}
