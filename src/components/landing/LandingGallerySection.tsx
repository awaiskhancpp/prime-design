'use client'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { GalleryGrid } from './GalleryGrid'

type GalleryItem = { url: string; caption?: string }

/**
 * The single-folder gallery (kitchen and bathroom landing pages). Its header
 * is the site's `SectionHeader`, like every other section: the small "Kitchen
 * Gallery" / "Bathroom Gallery" label is the eyebrow, the h2 is the heading
 * and the line of copy below it is the description. It used to be a bespoke
 * two-column grid — heading on the left, eyebrow and copy on the right —
 * which is the kind of per-section header the shared component exists to
 * replace.
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
      {heading || eyebrow || description ? (
        <SectionHeader eyebrow={eyebrow} title={heading} description={description} align="center" />
      ) : null}
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
