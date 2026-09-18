'use client'

import { Section } from '@/components/ui/Section'
import { GalleryGrid } from './GalleryGrid'

type GalleryItem = { url: string; caption?: string }

/**
 * The single-folder gallery (kitchen and bathroom landing pages). Its header
 * mirrors `LandingGalleryTabs` — heading on the left, the small "Kitchen
 * Gallery" / "Bathroom Gallery" label and its line of copy on the right — so
 * the two gallery layouts read the same across the site.
 *
 * `eyebrow` and `description` used to be dropped here: the block stored both,
 * the tabbed gallery rendered both, and this path rendered only the heading,
 * so that copy silently vanished on every page using a single gallery.
 */
export function LandingGallerySection({
  eyebrow,
  heading,
  description,
  items,
  lightbox = false,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  items: GalleryItem[]
  lightbox?: boolean
}) {
  if (!items.length) return null
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
      <div className="mt-8">
        <GalleryGrid
          images={items.map((item) => item.url)}
          captions={items.map((item) => item.caption)}
          altPrefix={heading || 'Project'}
          lightbox={lightbox}
        />
      </div>
    </Section>
  )
}
