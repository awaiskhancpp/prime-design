import Image from '@/components/ui/Image'
import { ArrowRight } from 'lucide-react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { RichTextValue } from '@/lib/richText'

export type ServiceCraftsmanshipContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  body: string[]
  /** The section's photos — the design renders with one or two; none is fine. */
  images?: string[]
  /** Button under the copy; no button renders when this is absent. */
  cta?: { label?: string; href?: string }
}

/**
 * "Craftsmanship That Transforms" — the copy-beside-photographs section on the
 * ADU, home remodeling, complete renovation and bathroom pages.
 *
 * ── What the real content is ──────────────────────────────────────────────
 *
 * Copy comes from Payload (`service.craftsmanship`, Lexical rich text): an h2
 * ("Craftsmanship That Transforms"; the bathroom page instead says "Let's
 * build your dream bathroom, step-by-step"), an h3 ("We make it easy") and
 * one or two paragraphs. The process-slot caller passes the same shape as
 * plain props instead.
 *
 * The photos are `service.craftsmanshipImages`, and every page that has them
 * carries exactly **two**: ADU-3 + ADU-10, 130-1 + 133-1, Hardscape-1 +
 * New-Construction-3, prime13-3 + Prime15-1. That detail drives the whole
 * layout below.
 *
 * ── Why the photos are laid out this way ──────────────────────────────────
 *
 * The photos use an offset, overlapping composition based on the supplied
 * reference. Each stays in its own square-cornered frame; the overlap is a
 * visual layer, not a crop/detail treatment. The text stays together in the
 * original opposite column. With only one photo, it fills the image column.
 *
 * ── Why the heading goes through SectionHeader ────────────────────────────
 *
 * Only the fallback (non-rich-text) path used `SectionHeader` before, so the
 * four pages that actually have CMS copy rendered their h2 through the rich
 * text converters instead — `text-3xl font-semibold text-ink`, a different
 * weight, colour and size from every other section heading on the page, and
 * with no brass accent. The h2 is now lifted out of the rich text the same
 * way the h3 already was, and both paths render the one shared header.
 */
export function ServiceCraftsmanshipTransformsSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  images,
  cta,
  content,
}: ServiceCraftsmanshipContent & { content?: RichTextValue }) {
  // The WordPress section carries a small line ("We make it easy") between
  // its heading and body, and the heading itself as an h2. On this design
  // those are the eyebrow and the section header, so both are lifted out of
  // the rich text; the paragraphs are what stays and flows under the heading.
  let eyebrowText = eyebrow
  let headingLead = heading
  let headingLast = headingAccent
  let contentToRender = content
  const root = (content as { root?: { children?: unknown[] } } | undefined)?.root
  if (root && Array.isArray(root.children)) {
    const children = root.children

    /** The first heading with this tag, and where it sits. */
    const find = (tag: 'h2' | 'h3') => {
      const index = children.findIndex((child) => {
        const node = child as { type?: string; tag?: string }
        return node?.type === 'heading' && node?.tag === tag
      })
      if (index < 0) return { index, text: '' }
      const node = children[index] as { children?: Array<{ text?: string }> }
      const text = (node.children ?? [])
        .map((child) => child.text ?? '')
        .join('')
        .trim()
      return { index: text ? index : -1, text }
    }

    const h3 = find('h3')
    const h2 = find('h2')

    if (h3.text) eyebrowText = h3.text
    if (h2.text) {
      // Last word in brass — the same "heading--gradient" treatment the
      // fallback path and `ServiceDetailPage`'s process slot already use.
      const words = h2.text.split(/\s+/)
      headingLast = words.length > 1 ? words[words.length - 1] : ''
      headingLead = headingLast ? words.slice(0, -1).join(' ') : h2.text
    }
    if (h3.index >= 0 || h2.index >= 0) {
      contentToRender = {
        ...(content as object),
        root: {
          ...root,
          children: children.filter((_, index) => index !== h3.index && index !== h2.index),
        },
      } as RichTextValue
    }
  }

  // Photos come from Payload only — no stand-in image is substituted.
  const photos = (images ?? []).filter(Boolean)

  const description = contentToRender ? (
    // The converters put `mt-3` on every paragraph including the first;
    // inside the header that would double up with its own spacing.
    <div className="[&>p:first-child]:mt-0">
      <RichTextContent data={contentToRender} />
    </div>
  ) : body.length ? (
    <div className="grid gap-4">
      {body.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  ) : null

  return (
    <Section>
      <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1fr] lg:gap-14">
        <CraftsmanshipGallery photos={photos} />

        <div>
          <SectionHeader
            size="lg"
            eyebrow={eyebrowText || undefined}
            title={
              headingLast ? (
                <>
                  {headingLead} <span className="text-brass">{headingLast}</span>
                </>
              ) : (
                headingLead
              )
            }
            description={description}
          />

          {cta?.label && cta?.href ? (
            <div className="mt-9">
              <Button
                href={cta.href}
                className="border-brass bg-brass text-white hover:border-brass-deep hover:bg-brass-deep"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}

/**
 * A layered pair that follows the reference's offset composition. Both
 * images retain square corners, and a single image falls back to one full
 * frame rather than leaving an empty placeholder.
 */
function CraftsmanshipGallery({ photos }: { photos: string[] }) {
  const galleryPhotos = photos.slice(0, 2)
  if (!galleryPhotos.length) return null
  const [first, second] = galleryPhotos

  return (
    <div className="relative">
      {second ? (
        <div className="relative aspect-[5/4] w-full">
          <div className="absolute left-0 top-0 z-10 aspect-[4/3] w-[72%] overflow-hidden border border-white bg-paper-2 shadow-xl shadow-ink/15">
            <Image
              src={first}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 34vw, 68vw"
            />
          </div>
          <div className="absolute bottom-0 right-0 z-20 aspect-[4/3] w-[72%] overflow-hidden border border-white bg-paper-2 shadow-xl shadow-ink/15">
            <Image
              src={second}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 34vw, 68vw"
            />
          </div>
        </div>
      ) : (
        <div className="relative aspect-[4/3] w-full overflow-hidden border border-white bg-paper-2 shadow-xl shadow-ink/15">
          <Image
            src={first}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 46vw, 90vw"
          />
        </div>
      )}
    </div>
  )
}
