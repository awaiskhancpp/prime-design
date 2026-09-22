import Image from 'next/image'
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
 * The previous design insetted the second photo over the bottom-left corner
 * of the first, inside a thick white border. That is the "detail callout"
 * idiom — it tells the reader the small picture is a crop of the large one.
 * These pairs are nothing of the sort: they are two unrelated projects, so
 * the composition was actively lying about the content, and it also hid a
 * corner of the first photograph behind the second.
 *
 * So the pair is now a **diptych**: two separate frames, side by side, one
 * never touching the other. They are deliberately not matched rectangles —
 * different widths (4:5 portrait against a square) with their bottoms on one
 * line, so the shorter one steps down from the taller. Two different shapes
 * on a shared baseline read as two photographs of equal standing; two
 * identical stacked rectangles read as a contact sheet, and an overlap reads
 * as a zoom. The offset paper block behind the top-left corner and the brass
 * rule under the baseline are the site's existing accents (see
 * `LandingCraftsmanshipSection`), carrying the depth the drop-shadow inset
 * used to provide.
 *
 * Because both frames are aspect-ratio'd rather than fixed-height, the block
 * scales with its column, and the two columns are centred against each other
 * — which matters here because the copy ranges from one short paragraph
 * (bathroom, ~230 characters) to two long ones (~700).
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
      <div className="grid items-center gap-14 lg:grid-cols-[0.95fr_1fr] lg:gap-20">
        <CraftsmanshipDiptych photos={photos} />

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
 * The photographs: one frame on its own, or two as a diptych.
 *
 * `items-end` is what makes the pair read as a composition rather than a
 * grid — the two frames share a baseline, and the squarer second one steps
 * down from the taller first. Neither ever covers the other.
 */
function CraftsmanshipDiptych({ photos }: { photos: string[] }) {
  if (!photos.length) return null
  const [first, second] = photos

  return (
    <div className="relative">
      {/* An empty brass-outlined square set behind the first frame's top-left
          corner — depth without a second photo sitting on top of the first.
          Hidden on the narrowest screens, where it would push past the
          container gutter. */}
      <span
        aria-hidden
        className="absolute -left-4 -top-4 hidden h-28 w-28 border border-brass/40 bg-paper-2/60 sm:block lg:-left-6 lg:-top-6 lg:h-44 lg:w-44"
      />

      {second ? (
        // Side by side from `sm` up. On a phone the diptych would put two
        // ~150px-wide photographs next to each other, too small to read, so
        // there they stack at full width — still two separate frames, still
        // two different shapes.
        <div className="relative grid items-end gap-4 sm:grid-cols-[1.12fr_0.88fr] sm:gap-5">
          <div className="relative aspect-[4/3] overflow-hidden bg-paper-2 shadow-xl shadow-ink/10 sm:aspect-[4/5]">
            <Image
              src={first}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 92vw"
            />
          </div>
          <div className="relative aspect-[16/9] overflow-hidden bg-paper-2 shadow-lg shadow-ink/10 sm:aspect-square">
            <Image
              src={second}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 20vw, (min-width: 640px) 36vw, 92vw"
            />
          </div>
        </div>
      ) : (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-2 shadow-xl shadow-ink/10">
          <Image
            src={first}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 46vw, 90vw"
          />
        </div>
      )}

      {/* A hairline the full width of the pair, brass at its start: it draws
          the shared baseline the two frames sit on, so they read as one
          arrangement rather than two pictures that happen to be adjacent. */}
      <div aria-hidden className="relative mt-6 h-px w-full bg-line">
        <span className="absolute inset-y-0 left-0 w-20 bg-brass" />
      </div>
    </div>
  )
}
