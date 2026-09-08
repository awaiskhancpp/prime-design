import { Check } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import type { ServiceContentBlock, ServiceDetail } from '@/lib/services'
import { ServiceOfferingsSection } from './ServiceOfferingsSection'
import { ServiceProcessSection } from './ServiceProcessSection'
import { ServiceVideoSection } from './ServiceVideoSection'
import { ServiceQuoteSection } from './ServiceQuoteSection'

/**
 * Renders the `contentBlocks[]` array of a service — the curated, per-page
 * content authored in Payload ("Page Content" blocks). Each block type maps
 * to one small presentational component below; block types that already have
 * a dedicated section component (process, gallery, sub-services, video,
 * quote) delegate to those directly.
 */

/** Shared two-column "text + optional image" layout used by most blocks. */
function MediaTextLayout({
  image,
  imageSide = 'right',
  imageAlt,
  children,
}: {
  image?: string
  imageSide?: string
  imageAlt: string
  children: ReactNode
}) {
  // `imageSide === 'right'` is the natural order; anything else flips the
  // columns on desktop so the image renders on the left.
  const flipColumns = imageSide !== 'right' ? 'md:[&>div:first-child]:order-2' : ''

  return (
    <div className={`grid gap-8 md:grid-cols-2 md:items-center ${flipColumns}`.trim()}>
      {children}
      {image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
    </div>
  )
}

/** `intro` / `image-text` — eyebrow + heading + body + optional bullet list. */
function IntroBlock({
  block,
}: {
  block: Extract<ServiceContentBlock, { blockType: 'intro' | 'image-text' }>
}) {
  return (
    <MediaTextLayout image={block.image} imageSide={block.imageSide} imageAlt={block.heading}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {block.eyebrow}
        </p>
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink">{block.heading}</h2>
        <p className="mt-4 text-base leading-8 text-ink-2/75">{block.body}</p>
        {block.items && block.items.length > 0 && (
          <ul className="mt-5 grid gap-3 text-base leading-7 text-ink-2/70">
            {block.items.map((item) => (
              <li key={item.text} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
                {item.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </MediaTextLayout>
  )
}

/** `icon-feature-list` — heading + intro + check-marked title/description rows. */
function IconFeatureListBlock({
  block,
}: {
  block: Extract<ServiceContentBlock, { blockType: 'icon-feature-list' }>
}) {
  return (
    <MediaTextLayout image={block.image} imageSide={block.imageSide} imageAlt={block.heading}>
      <div>
        <h2 className="font-display text-3xl font-semibold text-ink">{block.heading}</h2>
        {block.intro && <p className="mt-3 text-base leading-7 text-ink-2/70">{block.intro}</p>}
        <div className="mt-6 divide-y divide-line border-t border-line">
          {block.items.map((item) => (
            <div key={item.title} className="flex items-start gap-3 py-4">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brass text-white">
                <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              </span>
              <div>
                <p className="font-semibold text-ink-2">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink-2/70">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MediaTextLayout>
  )
}

/** `checklist` — eyebrow + italic description + bullet checklist. */
function ChecklistBlock({
  block,
}: {
  block: Extract<ServiceContentBlock, { blockType: 'checklist' }>
}) {
  return (
    <MediaTextLayout image={block.image} imageSide={block.imageSide} imageAlt={block.heading}>
      <div>
        {block.eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            {block.eyebrow}
          </p>
        )}
        <h2 className="mt-3 font-display text-3xl font-semibold text-ink">{block.heading}</h2>
        {block.description && (
          <p className="mt-3 text-base italic leading-7 text-ink-2/70">{block.description}</p>
        )}
        <ul className="mt-5 grid gap-3">
          {block.items.map((item) => (
            <li
              key={item.text}
              className="flex items-start gap-3 text-base leading-7 text-ink-2/75"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brass/15 text-brass">
                <Check className="h-3 w-3" strokeWidth={3} aria-hidden />
              </span>
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </MediaTextLayout>
  )
}

/** `feature-list` / `benefits` — simple heading + dot bullet list (no image). */
function FeatureListBlock({
  block,
}: {
  block: Extract<ServiceContentBlock, { blockType: 'feature-list' | 'benefits' }>
}) {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold text-ink">{block.heading}</h2>
      <ul className="mt-5 grid gap-3 text-sm leading-6 text-ink-2/75">
        {block.items.map((item: { text: string }) => (
          <li key={item.text} className="flex gap-3">
            <span className="text-brass">•</span>
            {item.text}
          </li>
        ))}
      </ul>
    </div>
  )
}

/** `gallery` — optional heading + responsive photo grid. */
function GalleryBlock({
  block,
  service,
}: {
  block: Extract<ServiceContentBlock, { blockType: 'gallery' }>
  service: ServiceDetail
}) {
  return (
    <div>
      {block.heading && (
        <h2 className="mb-6 font-display text-3xl font-semibold text-ink">{block.heading}</h2>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {block.images.map((image, imageIndex) => (
          <div
            key={`${image}-${imageIndex}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
            <Image
              src={image}
              alt={`${service.title} image ${imageIndex + 1}`}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, 100vw"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Map a content block to its component. Returns `null` for block types this
 * renderer does not handle (the caller filters those out beforehand).
 */
function renderContentBlock(service: ServiceDetail, block: ServiceContentBlock, index: number) {
  const key = `${block.blockType}-${index}`

  switch (block.blockType) {
    case 'intro':
    case 'image-text':
      return <IntroBlock key={key} block={block} />
    case 'icon-feature-list':
      return <IconFeatureListBlock key={key} block={block} />
    case 'checklist':
      return <ChecklistBlock key={key} block={block} />
    case 'feature-list':
    case 'benefits':
      return <FeatureListBlock key={key} block={block} />
    case 'process':
      return (
        <ServiceProcessSection
          key={key}
          eyebrow="Our process"
          title={block.heading}
          steps={block.steps}
        />
      )
    case 'gallery':
      return <GalleryBlock key={key} block={block} service={service} />
    case 'sub-services':
      return (
        <ServiceOfferingsSection
          key={key}
          embedded
          title={block.heading}
          cards={block.items.map((item) => ({
            title: item.title,
            description: item.description,
            image: item.image || '/services/home-remodeling.jpeg',
            href: item.link || '/contact',
          }))}
        />
      )
    case 'video':
      return (
        <ServiceVideoSection
          key={key}
          embedded
          title={block.heading || 'See the difference'}
          videoUrl={block.videoUrl}
          poster={block.poster}
        />
      )
    case 'quote':
      return (
        <ServiceQuoteSection
          key={key}
          heading="Our promise"
          quote={block.quote}
          attribution={block.attribution || 'Prime Design & Build'}
          image={service.image}
        />
      )
    default:
      return null
  }
}

export function ServiceContentBlocks({
  service,
  blocks,
}: {
  service: ServiceDetail
  blocks: NonNullable<ServiceDetail['contentBlocks']>
}) {
  return (
    <div className="grid gap-14">
      {blocks.map((block, index) => renderContentBlock(service, block, index))}
    </div>
  )
}
