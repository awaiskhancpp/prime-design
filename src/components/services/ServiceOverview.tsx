import Image from 'next/image'
import type { ServiceDetail } from '@/lib/services'
import { RichTextContent } from '@/components/rich-text/RichTextContent'

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
 * Static "overview" block used by service pages that have no CMS-authored
 * content blocks. Renders the page's key features, benefits and (optionally)
 * the numbered process list in a two-column layout with a couple of project
 * photos on the left.
 *
 * Each list can be overridden from Payload with rich text
 * (`service.overviewRich`) — when the editor filled the field, it renders
 * through `RichTextContent` with the same brass-marker styling; otherwise
 * the curated static list below is shown.
 *
 * - `showInlineProcess` — render the process list inline (right column).
 * - `hasVisualProcess`  — the layout renders process steps elsewhere with
 *   images, so the inline list would be redundant even when requested.
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
  // Feature image plus the first two gallery shots, de-duplicated.
  const sideImages = [...new Set([service.image, ...service.gallery].filter(Boolean))].slice(0, 2)
  const showProcess =
    showInlineProcess && !hasVisualProcess && Boolean(rich?.process || service.processSteps.length > 0)

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
      {/* Left column — heading and project photos. */}
      <div>
        <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
          {service.introHeading || `${service.title} — expanding your living space`}
        </h2>
        <div className="mt-3 h-px w-20 bg-brass" />
        <div className="grid gap-5">
          {sideImages.map((image, index) => (
            <div key={`${image}-${index}`} className="relative aspect-[4/3] overflow-hidden ">
              <Image
                src={image}
                alt={`${service.title} project photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 40vw, 100vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right column — key features, benefits, optional inline process. */}
      <div className="grid gap-5">
        <div className="mt-3 grid gap-10">
          <div>
            <h3 className="font-display text-xl font-medium text-ink-2">Key Features:</h3>
            {rich?.keyFeatures ? (
              <RichTextContent data={rich.keyFeatures} />
            ) : (
              <ul className="mt-4 grid gap-3 text-base leading-7 text-ink-2/70">
                {service.keyFeatures.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="font-display text-xl font-medium text-ink-2">
              Benefits of {service.title}:
            </h3>
            {rich?.benefits ? (
              <RichTextContent data={rich.benefits} />
            ) : (
              <ul className="mt-4 grid gap-3 text-base leading-7 text-ink-2/70">
                {service.benefits.map((item) => {
                  const { title, description } = splitLabeledLine(item)
                  return (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
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
          </div>

          {showProcess ? (
            <div>
              <h3 className="font-display text-xl font-medium text-ink-2">Process:</h3>
              {rich?.process ? (
                <RichTextContent data={rich.process} />
              ) : (
                <>
                  <p className="mt-3 text-base leading-7 text-ink-2/70">
                    Our {service.title.toLowerCase()} process is designed to be seamless and
                    efficient. Here&rsquo;s an overview of how we work:
                  </p>
                  <ol className="mt-5 grid gap-4 text-base leading-7 text-ink-2/70">
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
