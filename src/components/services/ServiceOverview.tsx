import Image from 'next/image'
import type { ReactNode } from 'react'

import type { ServiceDetail } from '@/lib/services'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { SectionHeader } from '@/components/ui/SectionHeader'

/**
 * Split a "Label: description" string coming from migrated WordPress copy
 * into its two halves. Lines without a separator come back whole so callers
 * can render them as plain text.
 */
export function splitLabeledLine(line: string) {
  const separator = line.indexOf(':')
  if (separator <= 0) return { title: line, description: '' }
  return { title: line.slice(0, separator).trim(), description: line.slice(separator + 1).trim() }
}

/**
 * The service "overview" section — what the service includes, why it pays off
 * and how the job runs — beside a pair of project photos.
 *
 * ── What the real content is ──────────────────────────────────────────────
 *
 * Three pages render this: `adu`, `additions` and `complete-renovation`.
 * All three carry exactly two photos and all three lists as Payload rich
 * text (`service.overviewRich`), never the static arrays — those are empty on
 * every service, so the `<ul>` fallbacks below are a dev/no-database path
 * only. The lists run 5 features, 4 benefits and 5 process steps: roughly
 * 1,400–2,200 characters of list beside two photographs.
 *
 * ── Why the layout is shaped this way ─────────────────────────────────────
 *
 * That imbalance is the whole design problem, and the previous layout made it
 * worse in three ways: the photos took the *wider* column (1.1fr) while the
 * text was squeezed into 0.9fr; the two photos were identical stacked 4:3
 * blocks running ~1,100px tall; and the section heading sat inside the photo
 * column, above the images, so it read as their caption rather than as the
 * title of the copy it actually introduces. The result was a section whose
 * two columns ended hundreds of pixels apart with a dead white void.
 *
 * So:
 *
 *   1. The heading moves out to full width, through `SectionHeader` — the
 *      site's one header component — so this section finally speaks the same
 *      typographic language as every other one.
 *   2. The columns swap emphasis: copy gets the wider track (1.2fr), photos
 *      the narrower (0.8fr), and the photo height is tuned so the two land
 *      together rather than 140px apart. The photo column is also `sticky`,
 *      the standard answer to a short column beside a tall one, which takes
 *      over if a page's lists ever outgrow the photographs.
 *   3. The two photos keep their own frames and are shaped differently — a
 *      4:3 above a wider 16:9 — rather than being two identical rectangles
 *      or, worse, one insetting over the other. They are different projects
 *      (the ADU page's ADU-9 and ADU-3, say), not a wide shot and a detail of
 *      it, so nothing in the composition may suggest the second is a crop of
 *      the first. The column measures 697px against 581px of copy.
 *   4. Process leaves the narrow column for a full-width band below. It is
 *      the one sequential list here, it is the longest, and in a narrow
 *      column it just padded the imbalance. Its steps lay out two-up.
 *
 * The three groups are separated by hairline rules with the site's eyebrow
 * label treatment rather than boxes — the same "one rule between cells, not
 * boxes" idiom used elsewhere — because features, benefits and process are
 * three different kinds of information and previously looked identical.
 *
 * - `showInlineProcess` — render the process band.
 * - `hasVisualProcess`  — the page renders process steps elsewhere with
 *   images, so this band would be redundant even when requested.
 */
export function ServiceOverview({
  service,
  showInlineProcess,
  hasVisualProcess,
}: {
  service: ServiceDetail
  showInlineProcess: boolean
  hasVisualProcess: boolean
}) {
  const rich = service.overviewRich
  // The section's own photos (WordPress puts two here). Fall back to the
  // hero image plus the first gallery shots when the CMS field is empty.
  const sideImages = service.overviewImages?.length
    ? service.overviewImages
    : [...new Set([service.image, ...service.gallery].filter(Boolean))].slice(0, 2)
  const showProcess =
    showInlineProcess && !hasVisualProcess && Boolean(rich?.process || service.processSteps.length > 0)

  const benefitsLabel = `Benefits of ${
    service.slug === 'adu'
      ? 'an ADU'
      : service.slug === 'additions' || service.slug === 'complete-renovation'
        ? 'Home Additions'
        : service.title
  }`

  return (
    <div>
      {/* The section's own title, full width — not stranded in the photo
          column where it read as a caption for the pictures. */}
      <SectionHeader title={service.introHeading || `${service.title} — expanding your living space`} />

      <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start lg:gap-16">
        <OverviewImagePair images={sideImages} title={service.title} />

        {/* Copy column — the wider track now, because it carries nine list
            items to the photo column's two pictures. */}
        <div>
          <OverviewGroup
            label="Key Features"
            /* Five short, single-clause bullets: two columns reads far better
               than a five-deep single file, and it keeps this group roughly
               level with the photographs beside it. The `[&_ul]` variants
               reach into `RichTextContent`'s markup from the outside so the
               shared converters — which blog posts and every other rich text
               field also use — are left alone. */
            listClassName="[&_ul]:sm:grid-cols-2 [&_ul]:sm:gap-x-10"
          >
            {rich?.keyFeatures ? (
              <RichTextContent data={rich.keyFeatures} />
            ) : (
              <StaticList items={service.keyFeatures} />
            )}
          </OverviewGroup>

          <OverviewGroup label={benefitsLabel}>
            {rich?.benefits ? (
              <RichTextContent data={rich.benefits} />
            ) : (
              <StaticList items={service.benefits} labeled />
            )}
          </OverviewGroup>
        </div>
      </div>

      {showProcess ? (
        // A hairline above the band marks it as the third movement of the
        // section rather than a loose list drifting under the columns.
        <div className="mt-14 border-t border-line pt-10 lg:mt-20">
          <OverviewGroup
            label="Process"
            /* Two-up steps. The lead-in paragraph some pages carry stays
               narrow above them — at full band width a paragraph would run to
               an unreadable measure. */
            listClassName="[&_ol]:md:grid-cols-2 [&_ol]:md:gap-x-12 [&_ol]:md:gap-y-6 [&_p]:max-w-2xl"
          >
            {rich?.process ? (
              <RichTextContent data={rich.process} />
            ) : (
              <>
                <p className="mt-3 text-base leading-7 text-ink-2/70">
                  Our {service.title.toLowerCase()} process is designed to be seamless and
                  efficient. Here&rsquo;s an overview of how we work:
                </p>
                <ol className="mt-5 grid gap-4 text-base leading-7 text-ink-2/70 md:grid-cols-2 md:gap-x-12 md:gap-y-6">
                  {service.processSteps.map((item, index) => {
                    const { title, description } = splitLabeledLine(item)
                    return (
                      <li key={item} className="flex gap-3">
                        <span className="font-semibold text-brass">{index + 1}.</span>
                        <span>
                          <strong className="font-semibold text-ink-2">{title}:</strong>{' '}
                          {description || item}
                        </span>
                      </li>
                    )
                  })}
                </ol>
              </>
            )}
          </OverviewGroup>
        </div>
      ) : null}
    </div>
  )
}

/**
 * One labelled group of copy.
 *
 * A hairline rule and an eyebrow-cased label rather than a bordered card:
 * three groups of bullets sitting in one column need separating, but boxes
 * would add three frames to a section that already carries two photographs.
 * The label keeps the site's standard eyebrow tokens (`text-xs`, uppercase,
 * `tracking-[0.2em]`, `text-brass-deep`) so it reads as structure rather than
 * as another heading competing with the section title.
 */
function OverviewGroup({
  label,
  listClassName,
  children,
}: {
  label: string
  /** Arbitrary variants applied to the rich text/list markup inside. */
  listClassName?: string
  children: ReactNode
}) {
  return (
    <section className="border-t border-line pt-6 first:border-t-0 first:pt-0 [&+&]:mt-10">
      <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">{label}</h3>
      <div className={listClassName}>{children}</div>
    </section>
  )
}

/**
 * The two project photographs, each in its own frame.
 *
 * Degrades on purpose: one image renders alone at full width, none renders
 * nothing. `overviewImages` is empty on several services and the fallback can
 * return fewer than two.
 */
function OverviewImagePair({ images, title }: { images: string[]; title: string }) {
  if (!images.length) return null
  const [primary, secondary] = images

  return (
    <div className="lg:sticky lg:top-28 lg:self-start">
      {/* Two separate frames, stacked — never one insetting over the other.
          The two photos on these pages are different projects (e.g. the ADU
          page's ADU-3 and ADU-10), not a wide shot and a detail of it, and an
          inset corner thumbnail claims exactly that relationship while also
          covering part of the first photograph.

          The second frame is the wider 16:9 rather than a second 4:3 both to
          keep the pair from reading as a contact sheet of matched crops and
          to hold the height down: measured at 1440px on all three pages the
          photo column runs 697px against 581px of copy, where two 4:3 frames
          would run 794px. The sticky keeps the photographs in view through
          that difference, and remains the safety net for a page whose lists
          grow past them. */}
      <div className="grid gap-4">
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
          <Image
            src={primary}
            alt={`${title} project photo 1`}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 34vw, 100vw"
          />
        </div>

        {secondary ? (
          <div className="relative aspect-[16/9] overflow-hidden bg-paper-2">
            <Image
              src={secondary}
              alt={`${title} project photo 2`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}

/**
 * The no-database fallback list. Every service resolves its lists from
 * Payload rich text today, so this renders only when `overviewRich` is empty
 * — it is kept so the page still works without a database connection, and
 * styled to match `RichTextContent`'s list output exactly.
 */
function StaticList({ items, labeled = false }: { items: string[]; labeled?: boolean }) {
  if (!items.length) return null
  return (
    <ul className="mt-4 grid gap-3 text-base leading-7 text-ink-2/70">
      {items.map((item) => {
        const { title, description } = labeled
          ? splitLabeledLine(item)
          : { title: item, description: '' }
        return (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" aria-hidden />
            <span>
              {labeled && description ? (
                <>
                  <strong className="font-semibold text-ink-2">{title}:</strong> {description}
                </>
              ) : (
                item
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
