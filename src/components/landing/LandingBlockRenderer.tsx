import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { ServiceVideoSection } from '@/components/services/ServiceVideoSection'
import BeforeAfterSlider from '@/components/blocks/BeforeAfterSlider'
import { LandingFindUs } from './LandingFindUs'
import { LandingGallerySection } from './LandingGallerySection'
import { LandingGalleryTabs } from './LandingGalleryTabs'
import { LandingTestimonialsSection } from './LandingTestimonialsSection'
import { LandingLuxuryCta } from './LandingLuxuryCta'
import { LandingCtaSection } from './LandingCtaSection'
import { LandingExperienceDifferenceSection } from './LandingExperienceDifferenceSection'
import { LandingPrimeDifferenceSection } from './LandingPrimeDifferenceSection'
import { VideoCarousel } from './VideoCarousel'
import { LandingProjectGridSection } from './LandingProjectGridSection'
import { LandingProjectsSection } from './LandingProjectsSection'
import { LandingRepairServicesSection } from './LandingRepairServicesSection'
import { LandingServiceAreasSection } from './LandingServiceAreasSection'
import { LandingFaqSection } from './LandingFaqSection'
import { LandingBookingSection } from './LandingBookingSection'
import { LandingContact } from './Contact'
import { TestimonialsSpotlight } from '@/components/testimonials/TestimonialsSpotlight'
import { faqCategories } from '@/lib/faq'
import type { LandingPageBlock } from '@/lib/landingPages'

type Block = LandingPageBlock & Record<string, unknown>

function text(value: unknown) {
  return typeof value === 'string' ? value : undefined
}

function mediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  if (typeof record.url === 'string') return record.url
  return mediaUrl(record.asset)
}

function isPayloadFileUrl(value: string) {
  return value.startsWith('/api/media/file/') || value.includes('/api/media/file/')
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
  const metadata = block.sourceMetadata as Record<string, unknown> | undefined
  const backgroundVideo = text(metadata?.backgroundVideoUrl)
  if ((!image && !backgroundVideo) || !text(block.heading))
    return <UnsupportedLandingBlock block={block} />
  return (
    <PageHero
      headerVariant="minimal"
      eyebrow={text(block.eyebrow) || 'Prime Design & Build'}
      title={text(block.heading) || ''}
      description={text(block.description)}
      image={image}
      backgroundVideo={backgroundVideo}
      imageAlt={text(block.heading) || 'Prime Design & Build'}
      cta={button(block.buttons)}
    />
  )
}

function ImageTextBlock({ block }: { block: Block }) {
  const image = mediaUrl(block.media)
  const heading = text(block.heading)
  if (!heading) return <UnsupportedLandingBlock block={block} />
  const cta = button(block.buttons)
  return (
    <Section className="bg-white">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className={text(block.alignment) === 'right' ? 'md:order-2' : undefined}>
          {text(block.eyebrow) ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
              {text(block.eyebrow)}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">{heading}</h2>
          {text(block.description) ? (
            <p className="mt-5 max-w-xl whitespace-pre-line text-base leading-7 text-ink-2/75">
              {text(block.description)}
            </p>
          ) : null}
          {cta ? (
            <Button href={cta.href} variant="outline" className="mt-6">
              {cta.label}
            </Button>
          ) : null}
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
            <Image
              src={image}
              alt={heading}
              fill
              className="object-cover"
              unoptimized={isPayloadFileUrl(image)}
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}

function VideoBlock({ block }: { block: Block }) {
  const url = text(block.externalUrl) || mediaUrl(block.video)
  if (!url) return <UnsupportedLandingBlock block={block} />
  return (
    <ServiceVideoSection
      eyebrow={text(block.eyebrow)}
      title={text(block.heading) || ''}
      description={text(block.description)}
      videoUrl={url}
      poster={mediaUrl(block.poster)}
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
                .map((item) => {
                  const value = item as Record<string, unknown>
                  return mediaUrl(value.media) || text(value.sourceUrl)
                })
                .filter((value): value is string => Boolean(value))
            : [],
        }))
        .filter((group) => group.images.length > 0)
    : []

  if (groups.length) {
    return (
      <LandingGalleryTabs
        heading={text(block.heading)}
        description={text(block.description)}
        tabs={groups}
      />
    )
  }

  const galleryItems = Array.isArray(block.items)
    ? block.items
        .flatMap((item) => {
          const value = item as Record<string, unknown>
          const url = mediaUrl(value.media) || text(value.sourceUrl)
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
    <LandingGallerySection heading={text(block.heading)} items={galleryItems} />
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

  return (
    <LandingProjectGridSection
      eyebrow={text(block.eyebrow)}
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
    <LandingProjectsSection
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
  const categories = Array.isArray(block.categories)
    ? block.categories
        .map((category) => {
          const value = category as Record<string, unknown>
          const title = text(value.title) || ''
          const source = faqCategories.find(
            (item) => item.title.toLowerCase() === title.toLowerCase(),
          )
          const questions = Array.isArray(value.questions) ? value.questions : []
          return {
            title,
            items: questions.length
              ? questions
                  .map((question) => {
                    const item = question as Record<string, unknown>
                    return { question: text(item.question) || '', answer: text(item.answer) || '' }
                  })
                  .filter((item) => item.question && item.answer)
              : source?.items || [],
          }
        })
        .filter((category) => category.items.length)
    : []
  return <LandingFaqSection heading={text(block.heading)} categories={categories} />
}

function VideoCarouselBlock({ block }: { block: Block }) {
  const items = Array.isArray(block.items) ? block.items : []
  const videos = items
    .map((item) => item as Record<string, unknown>)
    .map((item) => ({
      url: text(item.externalUrl) || mediaUrl(item.video),
      poster: mediaUrl(item.poster),
      caption: text(item.caption),
    }))
    .filter(
      (item): item is { url: string; poster: string | undefined; caption: string | undefined } =>
        Boolean(item.url),
    )

  if (!videos.length) return <UnsupportedLandingBlock block={block} />

  return (
    <Section className="bg-white">
      <VideoCarousel videos={videos} />
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
            {text(category.description) ? (
              <p className="mt-3 text-sm leading-6 text-ink-2/75">{text(category.description)}</p>
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
      heading={text(block.heading) || ''}
      description={text(block.description)}
      cta={button(block.buttons)}
      image={mediaUrl(block.media)}
    />
  ),
  'image-text': ImageTextBlock,
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
            url: text(item.externalUrl) || mediaUrl(item.video),
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

    return (
      <LandingPrimeDifferenceSection
        eyebrow={text(block.eyebrow)}
        heading={text(block.heading)}
        body={text(block.description)}
        checklist={features}
        videos={videos}
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
    <LandingServiceAreasSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
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
      heading={text(block.heading)}
      phone={text(block.phone)}
      email={text(block.email)}
      address={text(block.address)}
    />
  ),
  faq: FaqBlock,
  testimonials: () => <TestimonialsSpotlight />,
  'landing-testimonials': ({ block }) => (
    <LandingTestimonialsSection
      eyebrow={text(block.eyebrow)}
      heading={text(block.heading)}
      description={text(block.description)}
      providers={
        Array.isArray(block.providers)
          ? block.providers.map((provider) => {
              const value = provider as Record<string, unknown>
              return {
                name: text(value.name) || 'Reviews',
                collectionId: text(value.collectionId),
                reviewUrl: text(value.reviewUrl),
                rating: typeof value.rating === 'number' ? value.rating : undefined,
                reviewCount: typeof value.reviewCount === 'number' ? value.reviewCount : undefined,
                reviews: Array.isArray(value.reviews)
                  ? value.reviews.map((review) => {
                      const item = review as Record<string, unknown>
                      return {
                        reviewer: text(item.reviewer),
                        rating: typeof item.rating === 'number' ? item.rating : undefined,
                        body: text(item.body),
                        date: text(item.date),
                      }
                    })
                  : [],
              }
            })
          : []
      }
    />
  ),
  booking: ({ block }) => (
    <LandingBookingSection heading={text(block.heading) || 'Request an Estimate Appointment'} />
  ),
  'contact-form': () => <LandingContact />,
  'video-carousel': VideoCarouselBlock,
  'gallery-carousel': GalleryCarouselBlock,
}

export const sharedSectionRegistry = landingBlockRegistry

export function LandingBlockRenderer({ sections }: { sections: LandingPageBlock[] }) {
  return (
    <>
      {sections.map((section, index) => {
        const block = section as Block
        const Renderer = sharedSectionRegistry[block.blockType]
        return Renderer ? (
          <Renderer key={`${block.sourceId || block.blockType}-${index}`} block={block} />
        ) : (
          <UnsupportedLandingBlock key={`${block.blockType}-${index}`} block={block} />
        )
      })}
    </>
  )
}
