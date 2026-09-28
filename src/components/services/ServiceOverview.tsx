import type { ReactNode } from 'react'

import Image from '@/components/ui/Image'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceDetail } from '@/lib/services'
import { cn } from '@/lib/utils'

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

/** The brass square marker the rest of the site uses for editorial lists. */
function ListMarker() {
  return <span aria-hidden className="mt-2.5 h-1.5 w-1.5 shrink-0 bg-brass" />
}

/**
 * One row of the overview: a photograph beside its copy, with the photo on
 * the left or the right.
 *
 * The photo is always first in the DOM, so on a phone every row reads
 * photo-then-copy; `md:order-2` is what moves it to the right on a wide
 * screen. When there is no photo to show the copy takes the full width
 * rather than leaving half the row empty.
 */
function OverviewRow({
  title,
  image,
  imageAlt,
  imageSide = 'left',
  /** The two photos are deliberately different shapes — see the note in the
   *  component below on why they must not read as one shot and its crop. */
  imageRatio,
  children,
}: {
  title: string
  image?: string
  imageAlt: string
  imageSide?: 'left' | 'right'
  imageRatio: string
  children: ReactNode
}) {
  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-12 lg:gap-16">
      {image ? (
        <div
          className={cn(
            'relative overflow-hidden bg-paper-2',
            imageRatio,
            imageSide === 'right' && 'md:order-2',
          )}
        >
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      ) : null}

      <div className={image ? undefined : 'md:col-span-2'}>
        <SectionHeader title={title} size="sm" className="max-w-none" />
        <div className="mt-5">{children}</div>
      </div>
    </div>
  )
}

/**
 * The overview block used by service pages that have no CMS-authored content
 * blocks — the ADU, Home Additions and Complete Renovation pages.
 *
 * Laid out as two alternating photo-and-copy rows (Key Features with the
 * first photo, Benefits with the second), followed by the process as its own
 * tinted band. It used to be a single two-column grid with the heading and
 * both photos stacked in the left column and all three lists stacked in the
 * right, which left the photo column ending halfway up a very long wall of
 * text.
 *
 * The two photos are two different projects, never a wide shot and its
 * detail crop, so they get their own full-width frames in separate rows and
 * deliberately different shapes (16:10, then 4:3) — the same rule the
 * craftsmanship section follows. Both are wide enough to sit close to the
 * height of the copy beside them, which is what keeps the rows from reading
 * as a tall photo next to a short list.
 *
 * Each list can be overridden from Payload with rich text
 * (`service.overviewRich`) — when the editor filled the field it renders
 * through `RichTextContent` with the same brass-marker styling; otherwise
 * the migrated static list is shown.
 *
 * - `showInlineProcess` — render the process band.
 * - `hasVisualProcess`  — the layout renders process steps elsewhere with
 *   images, so this band would be a second copy of the same section.
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
  const [firstImage, secondImage] = sideImages

  const hasKeyFeatures = Boolean(rich?.keyFeatures) || service.keyFeatures.length > 0
  const hasBenefits = Boolean(rich?.benefits) || service.benefits.length > 0
  const showProcess =
    showInlineProcess &&
    !hasVisualProcess &&
    Boolean(rich?.process || service.processSteps.length > 0)

  // WordPress writes this page's benefits about home additions on the
  // Complete Renovation page too, so the heading names what the copy is
  // actually about rather than the page's own title.
  const benefitsSubject =
    service.slug === 'adu'
      ? 'an ADU'
      : service.slug === 'additions' || service.slug === 'complete-renovation'
        ? 'Home Additions'
        : service.title

  return (
    <>
      <Section>
        <SectionHeader
          title={service.introHeading || `${service.title} — expanding your living space`}
          size="lg"
        />

        <div className="mt-12 grid gap-14 lg:mt-16 lg:gap-20">
          {hasKeyFeatures ? (
            <OverviewRow
              title="Key Features"
              image={firstImage}
              imageAlt={`${service.title} project photo 1`}
              imageRatio="aspect-[16/10]"
            >
              {rich?.keyFeatures ? (
                <RichTextContent data={rich.keyFeatures} />
              ) : (
                <ul className="grid gap-3 text-base leading-7 text-ink-2/70">
                  {service.keyFeatures.map((item) => (
                    <li key={item} className="flex gap-3">
                      <ListMarker />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </OverviewRow>
          ) : null}

          {hasBenefits ? (
            <OverviewRow
              title={`Benefits of ${benefitsSubject}`}
              image={secondImage}
              imageAlt={`${service.title} project photo 2`}
              imageSide="right"
              imageRatio="aspect-[4/3]"
            >
              {rich?.benefits ? (
                <RichTextContent data={rich.benefits} />
              ) : (
                <ul className="grid gap-3 text-base leading-7 text-ink-2/70">
                  {service.benefits.map((item) => {
                    const { title, description } = splitLabeledLine(item)
                    return (
                      <li key={item} className="flex gap-3">
                        <ListMarker />
                        <span>
                          {description ? (
                            <>
                              <strong className="font-semibold text-ink-2">{title}:</strong>{' '}
                              {description}
                            </>
                          ) : (
                            item
                          )}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </OverviewRow>
          ) : null}
        </div>
      </Section>

      {showProcess ? (
        // Its own band, tinted against the white page, because it is its own
        // section — it used to be a third heading stacked under the benefits
        // list in the right-hand column.
        <Section className="">
          <SectionHeader
            align="center"
            title="Our Process"
            size="lg"
            description={
              rich?.process
                ? undefined
                : `Our ${service.title.toLowerCase()} process is designed to be seamless and efficient. Here’s an overview of how we work.`
            }
          />

          <div className="mx-auto mt-12 max-w-3xl">
            {rich?.process ? (
              <RichTextContent data={rich.process} />
            ) : (
              <ol>
                {service.processSteps.map((item, index) => {
                  const { title, description } = splitLabeledLine(item)
                  const isLast = index === service.processSteps.length - 1
                  return (
                    <li key={item} className="relative grid grid-cols-[auto_1fr] gap-x-5 pb-8 last:pb-0">
                      {/* The rule joining one step to the next. The numbered
                          token sits above it and carries the band's own
                          background, so the line stops cleanly at its edge. */}
                      {isLast ? null : (
                        <span
                          aria-hidden
                          className="absolute bottom-0 left-5 top-10 w-px bg-brass/30"
                        />
                      )}
                      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brass bg-paper-2 text-sm font-semibold text-brass">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div className="pt-1.5">
                        <p className="font-display text-lg font-medium text-ink-2">{title}</p>
                        {description ? (
                          <p className="mt-1 text-base leading-7 text-ink-2/70">{description}</p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </div>
        </Section>
      ) : null}
    </>
  )
}
