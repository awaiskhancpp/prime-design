import Link from 'next/link'
import type { ReactNode } from 'react'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'

import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { ServiceVideoSection } from '@/components/services/ServiceVideoSection'
import { ServiceImageTextSection } from '@/components/services/sections/ServiceImageTextSection'
import BeforeAfterSlider from '@/components/blocks/BeforeAfterSlider'
import { LandingFindUs } from './LandingFindUs'
import { LandingGallerySection } from './LandingGallerySection'
import { LandingGalleryTabs } from './LandingGalleryTabs'
import { LandingLuxuryCta } from './LandingLuxuryCta'
import { LandingCtaSection } from './LandingCtaSection'
import { LandingExperienceDifferenceSection } from './LandingExperienceDifferenceSection'
import { LandingPrimeDifferenceSection } from './LandingPrimeDifferenceSection'
import { LandingBenefitsSection } from './LandingBenefitsSection'
import { LandingCraftsmanshipSection } from './LandingCraftsmanshipSection'
import { LandingProjectGridSection } from './LandingProjectGridSection'
import { LandingServicesSection } from './LandingServicesSection'
import { LandingRepairServicesSection } from './LandingRepairServicesSection'
import { LandingBookingSection } from './LandingBookingSection'
import { LandingContact } from './Contact'
import { TestimonialsSpotlightSection } from '@/components/testimonials/TestimonialsSpotlightSection'
import { LandingTestimonialsSection } from '@/components/landing/LandingTestimonialsSection'
import { LandingFaqBlockSection } from './LandingFaqBlockSection'
import { richTextHasContent, richTextToPlainText, type RichTextValue } from '@/lib/richText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { LandingPageBlock } from '@/lib/landingPages'

type Block = LandingPageBlock & Record<string, unknown>

export function text(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

export function mediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  // A media group (uploaded `asset` + WordPress provenance fields): prefer
  // the real uploaded document over the group's `sourceUrl` hotlink — the
  // optimizer cannot fetch the WordPress origin (403), so the hotlink
  // renders as a broken image.
  if (record.asset && typeof record.asset === 'object') {
    const fromAsset = mediaUrl(record.asset)
    if (fromAsset) return fromAsset
  }
  if (typeof record.url === 'string') return record.url
  // Migrated WordPress media keeps its original URL in `sourceUrl` when the
  // file was never uploaded to the Payload media collection — use it so
  // images render even when only the source URL was preserved.
  if (typeof record.sourceUrl === 'string') return record.sourceUrl
  if (typeof record.full === 'string') return record.full
  return undefined
}

function button(value: unknown) {
  if (!Array.isArray(value)) return undefined
  const first = value.find((item) => item && typeof item === 'object') as
    Record<string, unknown> | undefined
  return first && typeof first.label === 'string' && typeof first.url === 'string'
    ? { label: first.label, href: first.url }
    : undefined
}

function UnsupportedLandingBlock({ block }: { block: Block }) {
  return (
    <div
      data-unsupported-landing-block={block.blockType}
      data-source-id={text(block.sourceId) || undefined}
      className="border border-dashed border-brass bg-paper-2 px-6 py-8 text-center text-sm text-ink-2"
    >
      Landing block <code>{block.blockType}</code> requires its integration renderer.
    </div>
  )
}

function HeroBlock({ block }: { block: Block }) {
  const image = mediaUrl(block.backgroundMedia)
  // The looping hero video is a real field now (`backgroundVideo.asset`, with
  // `sourceUrl` as WordPress provenance). It used to be readable only out of
  // `sourceMetadata.backgroundVideoUrl`, which meant it could not be changed
  // from the admin at all.
  const backgroundVideo = mediaUrl(block.backgroundVideo)
  if ((!image && !backgroundVideo) || !text(block.heading))
    return <UnsupportedLandingBlock block={block} />
  return (
    <PageHero
      eyebrow={text(block.eyebrow)}
      title={text(block.heading) || ''}
      description={text(block.description)}
      image={image}
      backgroundVideo={backgroundVideo}
      // The background image doubles as the video's poster — the same
      // convention the homepage hero block documents. Without this the hero
      // video was the one `<video>` on the whole site with no poster at all,
      // so a landing page opened on an empty black box until the clip had
      // buffered enough to paint its first frame.
      videoPoster={image}
      imageAlt={text(block.heading) || ''}
      cta={button(block.buttons)}
    />
  )
}

function BenefitsBlock({ block }: { block: Block }) {
  const items = Array.isArray(block.items)
    ? block.items
        .map((item) => item as Record<string, unknown>)
        .map((item) => ({
          title: text(item.title) || '',
          body: text(item.body),
          image: mediaUrl(item.media),
        }))
        .filter((item) => item.title)
    : []
  return (
    <LandingBenefitsSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      items={items}
      decorativeImage={mediaUrl(block.decorativeMedia)}
    />
  )
}

function CraftsmanshipBlock({ block }: { block: Block }) {
  const cards = Array.isArray(block.items)
    ? block.items
        .map((item) => item as Record<string, unknown>)
        .map((item) => ({
          title: text(item.title) || '',
          body: text(item.body),
          image: mediaUrl(item.media),
        }))
        .filter((item) => item.title)
    : []
  const images = Array.isArray(block.images)
    ? block.images
        .map((item) => mediaUrl((item as Record<string, unknown>)?.media))
        .filter((value): value is string => Boolean(value))
    : []
  return (
    <LandingCraftsmanshipSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      cards={cards}
      images={images}
      decorativeImage={mediaUrl(block.decorativeMedia)}
    />
  )
}

function ImageTextBlock({ block }: { block: Block }) {
  const heading = text(block.heading)
  if (!heading) return <UnsupportedLandingBlock block={block} />
  return (
    <ServiceImageTextSection
      eyebrow={text(block.eyebrow)}
      heading={heading}
      // `description` is rich text on this block now, so pass it as the
      // structured body rather than as a flattened string.
      body={block.description as RichTextValue}
      image={mediaUrl(block.media)}
      imageSide={text(block.alignment)}
      cta={button(block.buttons)}
    />
  )
}

function VideoBlock({ block }: { block: Block }) {
  const url = text(block.externalUrl) || mediaUrl(block.video)
  if (!url) return <UnsupportedLandingBlock block={block} />
  const summary = richTextHasContent(block.summary as RichTextValue) ? (
    <RichTextContent data={block.summary as RichTextValue} />
  ) : undefined
  return (
    <ServiceVideoSection
      eyebrow={text(block.eyebrow)}
      title={text(block.heading) || ''}
      description={text(block.description)}
      videoUrl={url}
      poster={mediaUrl(block.poster)}
      summary={summary}
      speakerName={text(block.speakerName)}
      speakerRole={text(block.speakerRole)}
    />
  )
}

function GalleryBlock({ block }: { block: Block }) {
  const groups = Array.isArray(block.groups)
    ? block.groups
        .map((group) => group as Record<string, unknown>)
        .map((group) => ({
          label: text(group.label) || text(group.heading) || 'Gallery',
          images: Array.isArray(group.items)
            ? group.items
                .map((item) => mediaUrl((item as Record<string, unknown>)?.media))
                .filter((value): value is string => Boolean(value))
            : [],
        }))
        .filter((group) => group.images.length > 0)
    : []

  if (groups.length) {
    return (
      <LandingGalleryTabs
        heading={text(block.heading)}
        eyebrow={text(block.eyebrow)}
        description={text(block.description)}
        tabs={groups}
        // The WordPress HappyFiles galleries these replace set
        // `lightbox: true`; the block mirrors that, so honour it.
        lightbox={block.lightbox !== false}
      />
    )
  }

  const galleryItems = Array.isArray(block.items)
    ? block.items
        .flatMap((item) => {
          const value = item as Record<string, unknown>
          const url =
            mediaUrl(value.media) ||
            (typeof value.sourceUrl === 'string' ? value.sourceUrl : undefined)
          if (!url) return []
          return {
            url,
            caption: text(value.caption),
          }
        })
        .map((item) => ({
          url: item.url,
          ...(item.caption ? { caption: item.caption } : {}),
        }))
    : []
  return galleryItems.length ? (
    <LandingGallerySection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      items={galleryItems}
      lightbox={block.lightbox !== false}
    />
  ) : (
    <Section className="bg-white">
      {text(block.heading) ? (
        <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">
          {text(block.heading)}
        </h2>
      ) : null}
      {text(block.description) ? (
        <p className="mt-4 max-w-2xl text-ink-2/75">{text(block.description)}</p>
      ) : null}
    </Section>
  )
}

function ProjectGridBlock({ block }: { block: Block }) {
  const items = Array.isArray(block.items)
    ? block.items
        .map((item) => {
          const value = item as Record<string, unknown>
          const link = value.link as Record<string, unknown> | undefined
          return {
            title: text(value.title) || '',
            image: mediaUrl(value.image),
            link: text(link?.url),
          }
        })
        .filter((item) => item.title)
    : []

  // The block stores the WordPress icon-box's SVG (`home.svg` beside "Our
  // Projects"). The section has always had a slot for it; it simply was
  // never passed, so a populated CMS field rendered as nothing.
  const icon = block.eyebrowIcon as Record<string, unknown> | undefined
  const eyebrowIcon = mediaUrl(icon?.iconMedia) || text(icon?.sourceSvgUrl)

  return (
    <LandingProjectGridSection
      eyebrow={text(block.eyebrow)}
      eyebrowIcon={eyebrowIcon}
      heading={text(block.heading)}
      description={text(block.description)}
      items={items}
    />
  )
}

function BeforeAfterBlock({ block }: { block: Block }) {
  const before = mediaUrl(block.beforeMedia)
  const after = mediaUrl(block.afterMedia)
  if (!before || !after) return <UnsupportedLandingBlock block={block} />
  return (
    <Section>
      <div className="grid gap-6 md:grid-cols-2">
        <BeforeAfterSlider
          beforeImage={before}
          afterImage={after}
          beforeAlt={text(block.beforeLabel) || 'Before'}
          afterAlt={text(block.afterLabel) || 'After'}
        />
      </div>
    </Section>
  )
}

function SubServicesBlock({ block }: { block: Block }) {
  const items = Array.isArray(block.items)
    ? block.items
        .map((item) => {
          const value = item as Record<string, unknown>
          const link = value.link as Record<string, unknown> | undefined
          return {
            title: text(value.title) || '',
            description: text(value.description),
            image: mediaUrl(value.media),
            link: text(link?.url),
          }
        })
        .filter((item) => item.title)
    : []
  return items.length ? (
    <LandingServicesSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      items={items}
    />
  ) : (
    <UnsupportedLandingBlock block={block} />
  )
}

function FaqBlock({ block }: { block: Block }) {
  // Only the block's own inline questions are read here. A category that names
  // no questions is filled from the FAQs collection by LandingFaqBlockSection,
  // so there is no hardcoded copy of the Q&A anywhere in this path.
  const categories = Array.isArray(block.categories)
    ? block.categories.map((category) => {
        const value = category as Record<string, unknown>
        const questions = Array.isArray(value.questions) ? value.questions : []
        return {
          title: text(value.title) || '',
          items: questions
            .map((question) => {
              const item = question as Record<string, unknown>
              return {
                question: text(item.question) || '',
                // FAQ answers are Lexical rich text; this section's design is a
                // single line per answer, so flatten it.
                answer: richTextToPlainText(item.answer),
              }
            })
            .filter((item) => item.question && item.answer),
        }
      })
    : []
  return (
    <LandingFaqBlockSection
      heading={text(block.heading)}
      description={text(block.description)}
      categories={categories}
    />
  )
}

function VideoCarouselBlock({ block }: { block: Block }) {
  const items = Array.isArray(block.items) ? block.items : []
  return (
    <Section className="bg-white">
      <div className="grid gap-8 md:grid-cols-2">
        {items.map((item, index) => {
          const value = item as Record<string, unknown>
          const url = text(value.externalUrl) || mediaUrl(value.video)
          return url ? (
            <VideoPlayer
              key={text(value.sourceId) || index}
              src={url}
              poster={mediaUrl(value.poster)}
              className="aspect-video w-full"
            />
          ) : null
        })}
      </div>
    </Section>
  )
}

function GalleryCarouselBlock({ block }: { block: Block }) {
  return <GalleryBlock block={{ ...block, groups: [], items: block.items }} />
}

function FeatureBlock({ block }: { block: Block }) {
  const features = Array.isArray(block.features)
    ? block.features
        .map((item) => item as Record<string, unknown>)
        .filter((item) => text(item.title))
    : []
  if (!text(block.heading)) return <UnsupportedLandingBlock block={block} />
  return (
    <Section className="bg-ink-2 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
        {text(block.eyebrow)}
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium md:text-5xl">{text(block.heading)}</h2>
      {text(block.description) ? (
        <p className="mt-4 max-w-3xl text-white/75">{text(block.description)}</p>
      ) : null}
      {features.length ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {features.map((item) => (
            <article key={text(item.title)} className="border border-white/10 p-5">
              <h3 className="font-display text-xl">{text(item.title)}</h3>
              {text(item.description) ? (
                <p className="mt-2 text-sm leading-6 text-white/75">{text(item.description)}</p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </Section>
  )
}

function ServiceAreasBlock({ block }: { block: Block }) {
  const areas = Array.isArray(block.areas)
    ? block.areas.map((item) => item as Record<string, unknown>).filter((item) => text(item.label))
    : []
  if (!areas.length || !text(block.heading)) return <UnsupportedLandingBlock block={block} />
  return (
    <Section>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
        {text(block.eyebrow)}
      </p>
      <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">
        {text(block.heading)}
      </h2>
      <div className="mt-8 flex flex-wrap gap-3">
        {areas.map((area) => {
          const link = area.link as Record<string, unknown> | undefined
          const label = text(area.label)!
          return link?.url ? (
            <Link
              key={label}
              href={text(link.url)!}
              className="border border-line px-4 py-3 text-sm text-ink"
            >
              {label}
            </Link>
          ) : (
            <span key={label} className="border border-line px-4 py-3 text-sm text-ink">
              {label}
            </span>
          )
        })}
      </div>
    </Section>
  )
}

function RepairServicesBlock({ block }: { block: Block }) {
  const categories = Array.isArray(block.categories)
    ? block.categories
        .map((item) => item as Record<string, unknown>)
        .filter((item) => text(item.title))
    : []
  if (!categories.length || !text(block.heading)) return <UnsupportedLandingBlock block={block} />
  return (
    <Section>
      <h2 className="font-display text-3xl font-medium text-ink md:text-5xl">
        {text(block.heading)}
      </h2>
      {text(block.description) ? (
        <p className="mt-4 max-w-3xl text-ink-2/75">{text(block.description)}</p>
      ) : null}
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {categories.map((category) => (
          <article key={text(category.title)} className="border border-line bg-white p-6">
            <h3 className="font-display text-2xl text-ink">{text(category.title)}</h3>
            {richTextToPlainText(category.description) ? (
              <p className="mt-3 text-sm leading-6 text-ink-2/75">
                {richTextToPlainText(category.description)}
              </p>
            ) : null}
            {Array.isArray(category.features) ? (
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-2/75">
                {category.features.map((feature) => (
                  <li key={text((feature as Record<string, unknown>).text)}>
                    {text((feature as Record<string, unknown>).text)}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  )
}

type Renderer = ({ block }: { block: Block }) => ReactNode

export const landingBlockRegistry: Record<string, Renderer> = {
  hero: HeroBlock,
  cta: ({ block }) => (
    <LandingCtaSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      cta={button(block.buttons)}
      image={mediaUrl(block.media)}
    />
  ),
  'image-text': ImageTextBlock,
  craftsmanship: CraftsmanshipBlock,
  'benefit-cards': BenefitsBlock,
  video: VideoBlock,
  gallery: GalleryBlock,
  'project-grid': ProjectGridBlock,
  'before-after': BeforeAfterBlock,
  'sub-services': SubServicesBlock,
  'prime-difference': ({ block }) => {
    const features = Array.isArray(block.features)
      ? block.features
          .map((item) => item as Record<string, unknown>)
          .map((item) => {
            const title = text(item.title)
            const description = text(item.description)
            return title && description ? `${title}: ${description}` : title || description
          })
          .filter((item): item is string => Boolean(item))
      : []
    const videos = Array.isArray(block.videos)
      ? block.videos
          .map((item) => item as Record<string, unknown>)
          .map((item) => ({
            // The imported Media document wins over `externalUrl`: the
            // latter is the WordPress/CDN origin kept for provenance, and
            // serving it hotlinks off-site for every visitor.
            url: mediaUrl(item.video) || text(item.externalUrl),
            poster: mediaUrl(item.poster),
            caption: text(item.caption),
          }))
          .filter((item) => Boolean(item.url))
          .map((item) => ({
            url: item.url as string,
            poster: item.poster,
            caption: item.caption,
          }))
      : []

    // Before/after pairs merged in from the WordPress section that follows
    // this one; they are this section's media column, not a section of
    // their own.
    const comparisons = Array.isArray(block.comparisons)
      ? block.comparisons
          .map((item) => item as Record<string, unknown>)
          .flatMap((item) => {
            const before = mediaUrl(item.beforeMedia)
            const after = mediaUrl(item.afterMedia)
            if (!before || !after) return []
            return [
              {
                before,
                after,
                beforeLabel: text(item.beforeLabel),
                afterLabel: text(item.afterLabel),
                caption: text(item.caption),
              },
            ]
          })
      : []

    return (
      <LandingPrimeDifferenceSection
        eyebrow={text(block.eyebrow)}
        heading={text(block.heading)}
        body={text(block.description)}
        checklist={features}
        videos={videos}
        comparisons={comparisons}
      />
    )
  },
  'experience-difference': ({ block }) => (
    <LandingExperienceDifferenceSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      body={text(block.description)}
      features={
        Array.isArray(block.features)
          ? block.features
              .map((item) => item as Record<string, unknown>)
              .filter((item): item is { title: string; description?: string } =>
                Boolean(text(item.title)),
              )
              .map((item) => ({ title: text(item.title)!, description: text(item.description) }))
          : []
      }
    />
  ),
  'service-areas': ({ block }) => (
    <LandscapingServiceAreas
      // Same coverage map, nothing clickable: see the `linked` prop there.
      linked={false}
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      regionHeading={text(block.regionHeading)}
      areas={
        Array.isArray(block.areas)
          ? block.areas.map((area) => {
              const value = area as Record<string, unknown>
              const link = value.link as Record<string, unknown> | undefined
              return { label: text(value.label), href: text(link?.url) }
            })
          : []
      }
    />
  ),
  'repair-services': ({ block }) => (
    <LandingRepairServicesSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      categories={
        Array.isArray(block.categories)
          ? (block.categories as Array<{
              title?: string
              description?: string
              features?: Array<{ text?: string }>
            }>)
          : []
      }
    />
  ),
  'luxury-cta': ({ block }) => (
    <LandingLuxuryCta
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      body={text(block.description)}
      link={button(block.buttons)?.href}
    />
  ),
  'find-us': ({ block }) => (
    <LandingFindUs
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      phone={text(block.phone)}
      email={text(block.email)}
      address={text(block.address)}
      // One pin per office, as real coordinates — the map is drawn from these
      // rather than from a geocoder reading the addresses back.
      mapPins={(Array.isArray(block.mapPins) ? block.mapPins : [])
        .map((pin) => pin as Record<string, unknown>)
        .map((pin) => ({
          latitude: typeof pin.latitude === 'number' ? pin.latitude : undefined,
          longitude: typeof pin.longitude === 'number' ? pin.longitude : undefined,
        }))}
    />
  ),
  faq: FaqBlock,
  testimonials: () => <TestimonialsSpotlightSection />,
  // `landing-testimonials` — the structured version WordPress authors on the
  // Google-Ads landing pages ("Our Happy Customers"). When the block carries
  // providers with reviews it renders the CMS-driven provider-tabs marquee;
  // the common heading-only case (WordPress shows its global review slider
  // there) falls back to the testimonials spotlight with the CMS heading.
  'landing-testimonials': ({ block }) => {
    const providers = (Array.isArray(block.providers) ? block.providers : [])
      .map((provider) => provider as Record<string, unknown>)
      .map((provider) => ({
        name: text(provider.name) || '',
        rating: typeof provider.rating === 'number' ? provider.rating : undefined,
        reviewCount: typeof provider.reviewCount === 'number' ? provider.reviewCount : undefined,
        reviews: (Array.isArray(provider.reviews) ? provider.reviews : [])
          .map((review) => review as Record<string, unknown>)
          .filter((review) => text(review.body))
          .map((review) => ({
            reviewer: text(review.reviewer),
            rating: typeof review.rating === 'number' ? review.rating : undefined,
            body: text(review.body),
            date: text(review.date),
          })),
      }))
      .filter((provider) => provider.reviews.length > 0)

    if (providers.length) {
      return (
        <LandingTestimonialsSection
          eyebrow={text(block.eyebrow)}
          heading={text(block.heading)}
          description={text(block.description)}
          providers={providers}
        />
      )
    }
    return <TestimonialsSpotlightSection heading={text(block.heading) || undefined} />
  },
  booking: ({ block }) => (
    <LandingBookingSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      consultationLabel={text(block.consultationLabel)}
      // The WordPress hero and CTA buttons link to `#contact_form`, which is
      // the booking section's own Bricks CSS id. Without it those buttons
      // are dead links on an ads landing page.
      id={text(block.anchorId)}
    />
  ),
  'contact-form': ({ block }) => (
    <LandingContact
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      id={text(block.anchorId)}
    />
  ),
  'video-carousel': VideoCarouselBlock,
  'gallery-carousel': GalleryCarouselBlock,
}

export const sharedSectionRegistry = landingBlockRegistry

/**
 * Where an in-page CTA lands when the section it names is not on the page.
 *
 * Highest intent first: the form itself, then the scheduler, then the closing
 * call to action, then the contact details. A "Get a Quote" that scrolls to
 * the phone number is a worse answer than one that scrolls to the form, and a
 * better one than a button that does nothing.
 */
const CONVERSION_BLOCKS = ['contact-form', 'booking', 'cta', 'luxury-cta', 'find-us'] as const

/** Anchors a block renders on its own, beyond its stored `anchorId`. */
const IMPLICIT_ANCHORS: Partial<Record<string, string>> = {
  'contact-form': 'contact', // `LandingContact` always answers to `#contact`
  'sub-services': 'services', // `LandingServicesSection` hardcodes `#services`
}

/**
 * Anchors the page chrome points at, which never appear in the block data.
 *
 * `LandingHeader`'s "Get a Quote" is hardcoded to `#contact` on every landing
 * page, so it has to be guaranteed even on a page with no contact block —
 * which is exactly how it died on `home-remodeling-information`.
 */
const CHROME_ANCHORS = ['contact']

/** Every `#target` any button, link or rich-text field on the page points at. */
function referencedAnchors(sections: LandingPageBlock[]): string[] {
  const found = new Set<string>()
  const walk = (value: unknown) => {
    if (typeof value === 'string') {
      if (value.startsWith('#') && value.length > 1) found.add(value.slice(1))
      return
    }
    if (Array.isArray(value)) {
      value.forEach(walk)
      return
    }
    if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk(sections)
  return [...found]
}

/**
 * Landing page sections, with every in-page CTA guaranteed a destination.
 *
 * The buttons are migrated WordPress copy and they name Bricks CSS ids —
 * `#contact_form`, `#schedule-call`. A block carries its own id in `anchorId`,
 * but only where the export gave one, and two pages ended up with buttons
 * pointing at nothing: `home-remodeling-information` has no contact-form or
 * booking block at all, so its header "Get a Quote" (`#contact`) and hero
 * "Schedule A Call" (`#schedule-call`) both died, and on
 * `kitchen-remodeling-information` three "Schedule a Free Consultation"
 * buttons named `#contact_form` while the contact block had no `anchorId`.
 *
 * Rather than invent anchor ids in the CMS — the buttons are real content and
 * the missing ids are a gap in the export, not an editorial decision — the
 * anchors that nothing else provides are rendered onto the page's best
 * conversion section. Nothing is added when the page already resolves, so a
 * page whose data is complete renders exactly as before.
 */
export function LandingBlockRenderer({ sections }: { sections: LandingPageBlock[] }) {
  const provided = new Set<string>()
  for (const section of sections) {
    const block = section as Block
    const anchorId = typeof block.anchorId === 'string' ? block.anchorId : undefined
    if (anchorId) provided.add(anchorId)
    const implicit = IMPLICIT_ANCHORS[block.blockType]
    if (implicit) provided.add(implicit)
  }

  const orphans = [...new Set([...referencedAnchors(sections), ...CHROME_ANCHORS])].filter(
    (anchor) => !provided.has(anchor),
  )
  const conversionIndex = orphans.length
    ? CONVERSION_BLOCKS.reduce<number>((found, blockType) => {
        if (found !== -1) return found
        return sections.findIndex((section) => (section as Block).blockType === blockType)
      }, -1)
    : -1

  return (
    <>
      {sections.map((section, index) => {
        const block = section as Block
        const Renderer = sharedSectionRegistry[block.blockType]
        const rendered = Renderer ? (
          <Renderer key={`${block.sourceId || block.blockType}-${index}`} block={block} />
        ) : (
          <UnsupportedLandingBlock key={`${block.blockType}-${index}`} block={block} />
        )

        if (index !== conversionIndex) return rendered

        return (
          <div key={`anchored-${block.sourceId || block.blockType}-${index}`}>
            {orphans.map((anchor) => (
              // `scroll-mt` keeps the landing header off the section it lands
              // on — the header is fixed, so an anchor without it puts the
              // heading underneath the bar.
              <span key={anchor} id={anchor} aria-hidden className="block scroll-mt-24" />
            ))}
            {rendered}
          </div>
        )
      })}
    </>
  )
}
