import { Check } from 'lucide-react'
import Image from 'next/image'
import type { ReactNode } from 'react'
import { HomeContact } from '@/components/blocks/HomeContact'
import { Contact as GalleryContact } from '@/components/gallery/Contact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import type { ServiceContentBlock, ServiceDetail } from '@/lib/services'
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getServiceProcess, ServiceProcessSection } from './ServiceProcessSection'
import { getServiceVideo, ServiceVideoSection } from './ServiceVideoSection'
import { HomeRemodelingProcessSection } from './sections/HomeRemodelingProcessSection'
import { ServiceAreasSection } from './ServiceAreasSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaq } from './ServiceFaq'
import { ServiceGallery } from './ServiceGallery'
import { ServiceHero } from './ServiceHero'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import {
  getCraftsmanshipContent,
  ServiceCraftsmanshipTransformsSection,
} from './sections/ServiceCraftsmanshipTransformsSection'
import {
  ServiceHomeRepairCategoriesSection,
  homeRepairCategoriesContent,
} from './sections/ServiceHomeRepairCategoriesSection'
import { ServiceWhyChooseUsSection } from './sections/ServiceWhyChooseUsSection'
import {
  getRealHomesContent,
  ServiceRealHomesStoriesSection,
} from './sections/ServiceRealHomesStoriesSection'
import {
  getWordPressDifferenceContent,
  ServicePrimeDifferenceSection,
} from './sections/ServicePrimeDifferenceSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { mediaUrl, sharedSectionRegistry, text } from '@/components/landing/LandingBlockRenderer'
import type { CarouselVideo } from '@/components/landing/VideoCarousel'

function splitLabeledLine(line: string) {
  const separator = line.indexOf(':')
  if (separator <= 0) return { title: line, description: '' }
  return { title: line.slice(0, separator).trim(), description: line.slice(separator + 1).trim() }
}

type ServicePageSections = {
  video: boolean
  videoFirst: boolean
  process: boolean
  inlineProcess: boolean
  offerings: boolean
  gallery: boolean
  quote: boolean
  craftsmanship: boolean
  realHomes: boolean
  siliconValleyLoves: boolean
  whyChooseUs: boolean
  homeRepairCategories: boolean
  homeRepairWhyChooseUs: boolean
  faq: boolean
  estimate: boolean
  reviews: boolean
  contact: boolean
  visualProcess: boolean
  homeProcess: boolean
  contactVariant: 'home' | 'gallery'
  processLabel: string
}

const defaultServicePageSections: ServicePageSections = {
  video: false,
  videoFirst: false,
  process: false,
  inlineProcess: false,
  offerings: false,
  gallery: false,
  quote: false,
  craftsmanship: false,
  realHomes: false,
  siliconValleyLoves: false,
  whyChooseUs: false,
  homeRepairCategories: false,
  homeRepairWhyChooseUs: false,
  faq: false,
  estimate: false,
  reviews: false,
  contact: false,
  visualProcess: false,
  homeProcess: false,
  contactVariant: 'home',
  processLabel: 'remodeling',
}

const servicePageSections: Record<string, ServicePageSections> = {
  adu: {
    ...defaultServicePageSections,
    inlineProcess: true,
    craftsmanship: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
  },
  additions: {
    ...defaultServicePageSections,
    video: true,
    inlineProcess: true,
    realHomes: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    processLabel: 'home addition',
  },
  'complete-renovation': {
    ...defaultServicePageSections,
    process: true,
    inlineProcess: true,
    craftsmanship: true,
    estimate: true,
    reviews: true,
    contact: true,
    homeProcess: true,
  },
  'kitchen-remodeling': {
    ...defaultServicePageSections,
    video: true,
    process: true,
    offerings: true,
    gallery: true,
    quote: true,
    faq: true,
    estimate: true,
    siliconValleyLoves: true,
    reviews: true,
    contact: true,
  },
  'bathroom-remodeling': {
    ...defaultServicePageSections,
    process: true,
    offerings: true,
    gallery: true,
    craftsmanship: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
    reviews: true,
    contact: true,
  },
  'home-remodeling': {
    ...defaultServicePageSections,
    video: true,
    process: true,
    gallery: true,
    craftsmanship: true,
    realHomes: true,
    siliconValleyLoves: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
    reviews: true,
    contact: true,
    homeProcess: true,
  },
  'home-repair-installation-services': {
    ...defaultServicePageSections,
    homeRepairCategories: true,
    homeRepairWhyChooseUs: true,
  },
  financing: {
    ...defaultServicePageSections,
    process: true,
    whyChooseUs: true,
    faq: true,
    estimate: true,
  },
  'european-kitchen': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'european-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'shaker-kitchen': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'shaker-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'custom-kitchen': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
  'custom-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    video: true,
    videoFirst: true,
    reviews: true,
    contact: true,
    visualProcess: true,
    contactVariant: 'gallery',
  },
}

function getServicePageSections(slug: string) {
  const normalized = slug.replace(/-silicon-valley$/, '')
  return (
    servicePageSections[slug] ||
    servicePageSections[normalized] ||
    servicePageSections[`${normalized}-silicon-valley`] ||
    defaultServicePageSections
  )
}

function ServiceOverview({
  service,
  showInlineProcess,
  hasVisualProcess,
}: {
  service: ServiceDetail
  showInlineProcess: boolean
  hasVisualProcess: boolean
}) {
  const sideImages = [...new Set([service.image, ...service.gallery].filter(Boolean))].slice(0, 2)

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
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

      <div className="grid gap-5">
        <div className="mt-3 grid gap-10">
          <div>
            <h3 className="font-display text-xl font-medium text-ink-2">Key Features:</h3>
            <ul className="mt-4 grid gap-3 text-base leading-7 text-ink-2/70">
              {service.keyFeatures.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-xl font-medium text-ink-2">
              Benefits of {service.title}:
            </h3>
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
          </div>

          {showInlineProcess && !hasVisualProcess && service.process.length > 0 ? (
            <div>
              <h3 className="font-display text-xl font-medium text-ink-2">Process:</h3>
              <p className="mt-3 text-base leading-7 text-ink-2/70">
                Our {service.title.toLowerCase()} process is designed to be seamless and efficient.
                Here’s an overview of how we work:
              </p>
              <ol className="mt-5 grid gap-4 text-base leading-7 text-ink-2/70">
                {service.process.map((item, index) => {
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
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
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
      {blocks.map((block: ServiceContentBlock, index) => {
        if (block.blockType === 'intro' || block.blockType === 'image-text')
          return (
            <div
              key={`${block.blockType}-${index}`}
              className={`grid gap-8 md:grid-cols-2 md:items-center ${block.imageSide === 'right' ? '' : 'md:[&>div:first-child]:order-2'}`}
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {block.eyebrow}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                  {block.heading}
                </h2>
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
              {block.image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                  <Image
                    src={block.image}
                    alt={block.heading}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              )}
            </div>
          )
        if (block.blockType === 'icon-feature-list')
          return (
            <div
              key={`${block.blockType}-${index}`}
              className={`grid gap-8 md:grid-cols-2 md:items-center ${block.imageSide === 'right' ? '' : 'md:[&>div:first-child]:order-2'}`}
            >
              <div>
                <h2 className="font-display text-3xl font-semibold text-ink">{block.heading}</h2>
                {block.intro && (
                  <p className="mt-3 text-base leading-7 text-ink-2/70">{block.intro}</p>
                )}
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
              {block.image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                  <Image
                    src={block.image}
                    alt={block.heading}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              )}
            </div>
          )
        if (block.blockType === 'checklist')
          return (
            <div
              key={`${block.blockType}-${index}`}
              className={`grid gap-8 md:grid-cols-2 md:items-center ${block.imageSide === 'right' ? '' : 'md:[&>div:first-child]:order-2'}`}
            >
              <div>
                {block.eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                    {block.eyebrow}
                  </p>
                )}
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                  {block.heading}
                </h2>
                {block.description && (
                  <p className="mt-3 text-base italic leading-7 text-ink-2/70">
                    {block.description}
                  </p>
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
              {block.image && (
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                  <Image
                    src={block.image}
                    alt={block.heading}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              )}
            </div>
          )
        if (block.blockType === 'feature-list' || block.blockType === 'benefits')
          return (
            <div key={`${block.blockType}-${index}`}>
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
        if (block.blockType === 'process')
          return (
            <ServiceProcessSection
              key={`${block.blockType}-${index}`}
              eyebrow="Our process"
              title={block.heading}
              steps={block.steps}
            />
          )
        if (block.blockType === 'gallery')
          return (
            <div key={`${block.blockType}-${index}`}>
              {block.heading && (
                <h2 className="mb-6 font-display text-3xl font-semibold text-ink">
                  {block.heading}
                </h2>
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
        if (block.blockType === 'sub-services')
          return (
            <ServiceOfferingsSection
              key={`${block.blockType}-${index}`}
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
        if (block.blockType === 'video')
          return (
            <ServiceVideoSection
              key={`${block.blockType}-${index}`}
              embedded
              title={block.heading || 'See the difference'}
              videoUrl={block.videoUrl}
              poster={block.poster}
            />
          )
        if (block.blockType === 'quote')
          return (
            <ServiceQuoteSection
              key={`${block.blockType}-${index}`}
              heading="Our promise"
              quote={block.quote}
              attribution={block.attribution || 'Prime Design & Build'}
              image={service.image}
            />
          )
      })}
    </div>
  )
}

// Maps a migrated service.sections[] block to the bespoke, hand-designed
// Service section component for that content type, wherever one exists —
// so migrated WordPress data renders through this site's actual designed
// service-page components instead of the generic landing-page versions.
// Block types with no dedicated Service design (before-after,
// find-us, video-carousel, gallery-carousel, project-grid) fall back to the
// shared landing registry, which already has a real design for each.
export function ServiceSectionRenderer({
  sections,
  service,
}: {
  sections: NonNullable<ServiceDetail['sections']>
  service: ServiceDetail
}) {
  const rendered: ReactNode[] = []
  const skip = new Set<number>()

  sections.forEach((rawSection, index) => {
    if (skip.has(index)) return
    const block = rawSection as Record<string, unknown>
    const blockType = block.blockType
    const headingText = text(block.heading) || ''
    const headingLower = headingText.toLowerCase()

    if (blockType === 'prime-difference') {
      const features = Array.isArray(block.features)
        ? (block.features as Array<Record<string, unknown>>).map((feature) => ({
            title: text(feature.title) || '',
            description: text(feature.description),
          }))
        : []
      const content = getWordPressDifferenceContent({
        eyebrow: text(block.eyebrow),
        heading: headingText || 'The Prime Difference',
        description: text(block.description),
        features,
      })
      const videos: CarouselVideo[] = Array.isArray(block.videos)
        ? (block.videos as Array<Record<string, unknown>>)
            .map((video) => ({
              url: text(video.externalUrl) || mediaUrl(video.video) || '',
              poster: mediaUrl(video.poster),
              caption: text(video.caption),
            }))
            .filter((video) => video.url)
        : []
      rendered.push(<ServicePrimeDifferenceSection key={index} {...content} videos={videos} />)
      return
    }

    if (blockType === 'experience-difference') {
      const features = Array.isArray(block.features)
        ? (block.features as Array<Record<string, unknown>>)
            .map((feature) => ({
              title: text(feature.title) || '',
              description: text(feature.description),
            }))
            .filter((item) => item.title)
        : []
      rendered.push(
        <ServiceWhyChooseUsSection
          key={index}
          heading={headingText || 'Why Choose Prime Design & Build?'}
          items={features.length ? features : undefined}
        />,
      )
      return
    }

    if (
      blockType === 'craftsmanship' ||
      (blockType === 'image-text' && headingLower.includes('craftsmanship'))
    ) {
      const defaultContent = getCraftsmanshipContent(service)
      const image = mediaUrl(block.media) || mediaUrl(block.image)
      const images: [string, string] = image
        ? [image, defaultContent.images[1] || service.image]
        : defaultContent.images
      const bodyText = text(block.description) || text(block.body)
      const bodyParagraphs = bodyText ? [bodyText] : defaultContent.body
      rendered.push(
        <ServiceCraftsmanshipTransformsSection
          key={index}
          eyebrow={text(block.eyebrow) || defaultContent.eyebrow}
          heading="Craftsmanship That"
          headingAccent="Transforms"
          body={bodyParagraphs}
          images={images}
          cta={defaultContent.cta}
        />,
      )
      return
    }

    if (
      blockType === 'process' ||
      (blockType === 'image-text' &&
        (headingLower.includes('client-centered') || headingLower.includes('process')))
    ) {
      if (
        service.slug === 'home-remodeling' ||
        service.slug === 'complete-renovation' ||
        headingLower.includes('client-centered')
      ) {
        rendered.push(<HomeRemodelingProcessSection key={index} />)
        return
      }

      const rawSteps = Array.isArray(block.steps)
        ? (block.steps as Array<Record<string, unknown>>)
        : []
      const steps = rawSteps.map((step, sIdx) => ({
        title: text(step.title) || `Step ${sIdx + 1}`,
        description: text(step.description) || '',
        image: mediaUrl(step.image),
      }))
      const fallbackProcess = getServiceProcess(service)
      rendered.push(
        <ServiceProcessSection
          key={index}
          eyebrow={text(block.eyebrow) || 'Our process'}
          title={headingText || fallbackProcess?.title || 'We make it easy for you'}
          description={text(block.description) || fallbackProcess?.description}
          steps={steps.length ? steps : (fallbackProcess?.steps || [])}
        />,
      )
      return
    }

    if (
      blockType === 'silicon-valley-loves' ||
      (blockType === 'image-text' && headingLower.includes('silicon valley loves'))
    ) {
      rendered.push(<ServiceSiliconValleyLovesSection key={index} />)
      return
    }

    if (
      blockType === 'quote' ||
      (blockType === 'image-text' &&
        (headingLower.includes('our promise') || headingLower.includes('crafting your dream home')))
    ) {
      const fallbackQuote = getServiceQuote(service.slug)
      rendered.push(
        <ServiceQuoteSection
          key={index}
          heading={headingText || fallbackQuote?.heading || 'Crafting your dream home, our promise'}
          quote={text(block.quote) || text(block.description) || fallbackQuote?.quote || ''}
          attribution={
            text(block.attribution) ||
            fallbackQuote?.attribution ||
            'Noah, Co-founder of Prime Design & Build'
          }
          image={mediaUrl(block.media) || mediaUrl(block.image) || service.image}
        />,
      )
      return
    }

    if (blockType === 'sub-services') {
      const cards = Array.isArray(block.items)
        ? (block.items as Array<Record<string, unknown>>)
            .map((item) => {
              const link = item.link as Record<string, unknown> | undefined
              return {
                title: text(item.title) || '',
                description: text(item.description) || '',
                image: mediaUrl(item.media) || service.image,
                href: text(link?.url) || '/contact',
              }
            })
            .filter((card) => card.title)
        : []
      if (cards.length) {
        rendered.push(
          <ServiceOfferingsSection
            key={index}
            eyebrow={text(block.eyebrow)}
            title={headingText || 'Our Services'}
            description={text(block.description)}
            cards={cards}
          />,
        )
        return
      }
    }

    if (blockType === 'repair-services') {
      const categories = Array.isArray(block.categories)
        ? (block.categories as Array<Record<string, unknown>>).map((category) => ({
            title: text(category.title) || 'Service',
            label: text(category.heading) || 'Includes:',
            image: mediaUrl(category.media) || service.image,
            body: text(category.description) || '',
            items: Array.isArray(category.features)
              ? (category.features as Array<Record<string, unknown>>)
                  .map((feature) => text(feature.text))
                  .filter((item): item is string => Boolean(item))
              : [],
          }))
        : []
      if (categories.length) {
        rendered.push(<ServiceHomeRepairCategoriesSection key={index} categories={categories} />)
        return
      }
    }

    if (blockType === 'landing-testimonials' || blockType === 'testimonials') {
      const testimonials = (Array.isArray(block.providers) ? block.providers : [])
        .flatMap((provider) => {
          const value = provider as Record<string, unknown>
          return Array.isArray(value.reviews) ? value.reviews : []
        })
        .map((review) => {
          const value = review as Record<string, unknown>
          return {
            quote: text(value.body) || '',
            attribution: text(value.reviewer) || 'Prime Design & Build client',
          }
        })
        .filter((item) => item.quote)
        .slice(0, 3)
      if (testimonials.length) {
        rendered.push(
          <ServiceRealHomesStoriesSection
            key={index}
            eyebrow={text(block.eyebrow) || '#1 Home Remodeling Company in Silicon Valley'}
            heading={headingText || 'Real Homes,'}
            headingAccent="Real Stories"
            description={
              text(block.description) ||
              'Explore the success stories of homeowners who entrusted Prime Design & Build.'
            }
            testimonials={testimonials}
            cta={{ label: 'Contact us now', href: '/contact' }}
          />,
        )
        return
      }
      if (blockType === 'testimonials') {
        rendered.push(<ProjectsReviews key={index} />)
        return
      }
    }

    if (blockType === 'cta') {
      if (
        headingLower.includes('estimate') ||
        headingLower.includes('schedule') ||
        headingLower.includes('get started')
      ) {
        rendered.push(<ServiceEstimateCta key={index} />)
        return
      }
    }

    if (blockType === 'contact-form' || blockType === 'booking' || blockType === 'form') {
      if (!rendered.some((node) => (node as { key?: string })?.key === 'service-contact')) {
        rendered.push(<HomeContact key="service-contact" />)
      }
      return
    }

    if (blockType === 'video') {
      const url = text(block.externalUrl) || mediaUrl(block.video)
      if (url) {
        rendered.push(
          <ServiceVideoSection
            key={index}
            eyebrow={text(block.eyebrow)}
            title={headingText || 'See the difference'}
            description={text(block.description)}
            videoUrl={url}
            poster={mediaUrl(block.poster)}
          />,
        )
        return
      }
    }

    if (blockType === 'gallery') {
      if (!rendered.some((node) => (node as { key?: string })?.key === 'service-gallery')) {
        rendered.push(<ServiceGallery key="service-gallery" service={service} />)
      }
      return
    }

    if (blockType === 'faq') {
      if (!rendered.some((node) => (node as { key?: string })?.key === 'service-faq')) {
        rendered.push(<ServiceFaq key="service-faq" slug={service.slug} />)
      }
      return
    }

    if (blockType === 'service-areas') {
      if (!rendered.some((node) => (node as { key?: string })?.key === 'service-areas')) {
        rendered.push(<ServiceAreasSection key="service-areas" service={service} />)
      }
      return
    }

    // No bespoke Service design for this block type — use the shared
    // landing registry's version, which is a real, finished design too
    // (hero is handled separately and excluded before this ever runs).
    const Renderer = sharedSectionRegistry[blockType as string]
    if (Renderer) rendered.push(<Renderer key={index} block={rawSection as never} />)
  })

  return <>{rendered}</>
}

export function ServiceTemplate({ service }: { service: ServiceDetail }) {
  const sections = getServicePageSections(service.slug)
  const hasCmsBlocks = Boolean(service.contentBlocks?.length)
  // Verified against the real WordPress export: these three pages only
  // ever existed at the `-silicon-valley` suffixed slug.
  const ContactSection = sections.contactVariant === 'gallery' ? GalleryContact : HomeContact
  const offerings = getServiceOfferings(service.slug)
  const fallbackVideo = sections.video ? getServiceVideo(service.slug) : undefined
  const process = getServiceProcess(service)
  const fallbackQuote = getServiceQuote(service.slug)
  const cmsQuote = service.contentBlocks?.find((block) => block.blockType === 'quote')
  const cmsVideos = service.contentBlocks?.filter((block) => block.blockType === 'video') ?? []
  const contentBlocks = service.contentBlocks?.filter((block) => {
    if (
      block.blockType === 'video' ||
      block.blockType === 'process' ||
      block.blockType === 'gallery' ||
      block.blockType === 'quote'
    )
      return false
    if (offerings && block.blockType === 'sub-services') return false
    return true
  })

  const videoSection = cmsVideos.length ? (
    cmsVideos.map((block, index) =>
      block.blockType === 'video' ? (
        <ServiceVideoSection
          key={`video-${index}`}
          title={block.heading || 'See the difference'}
          videoUrl={block.videoUrl}
          poster={block.poster}
        />
      ) : null,
    )
  ) : fallbackVideo ? (
    <ServiceVideoSection {...fallbackVideo} />
  ) : null

  const fallbackOrder = [
    'video',
    'estimate',
    'intro',
    'home-repair-categories',
    'why-choose-us',
    'real-homes',
    'offerings',
    'process',
    'gallery',
    'craftsmanship',
    'quote',
    'faq',
    'silicon-valley-loves',
    'reviews',
    'contact',
    'service-areas',
  ]
  const order = service.sectionOrder?.length ? service.sectionOrder : fallbackOrder
  const sectionNodes: Array<{ key: string; node: ReactNode }> = [
    {
      key: 'intro',
      node:
        !sections.homeRepairCategories && (contentBlocks?.length || !hasCmsBlocks) ? (
          <Section>
            {contentBlocks?.length ? (
              <ServiceContentBlocks service={service} blocks={contentBlocks} />
            ) : (
              <ServiceOverview
                service={service}
                showInlineProcess={sections.inlineProcess}
                hasVisualProcess={sections.visualProcess}
              />
            )}
          </Section>
        ) : null,
    },
    {
      key: 'home-repair-categories',
      node: sections.homeRepairCategories ? (
        <ServiceHomeRepairCategoriesSection categories={homeRepairCategoriesContent} />
      ) : null,
    },
    {
      key: 'why-choose-us',
      node:
        sections.homeRepairWhyChooseUs || sections.whyChooseUs ? (
          <ServiceWhyChooseUsSection />
        ) : null,
    },
    {
      key: 'real-homes',
      node: sections.realHomes ? (
        <ServiceRealHomesStoriesSection {...getRealHomesContent(service)} />
      ) : null,
    },
    { key: 'video', node: !sections.videoFirst ? videoSection : null },
    {
      key: 'offerings',
      node: sections.offerings && offerings ? <ServiceOfferingsSection {...offerings} /> : null,
    },
    {
      key: 'process',
      node: (() => {
        if (!sections.process) return null
        if (sections.homeProcess) return <HomeRemodelingProcessSection />
        const cmsProcess = service.sections?.find((s) => s.blockType === 'process') as Record<string, unknown> | undefined
        const rawSteps = Array.isArray(cmsProcess?.steps) ? (cmsProcess.steps as Array<Record<string, unknown>>) : []
        if (rawSteps.length) {
          const mappedSteps = rawSteps.map((s, sIdx) => ({
            title: String(s.title || `Step ${sIdx + 1}`),
            description: String(s.description || ''),
            image: typeof s.image === 'object' && s.image ? (s.image as { url?: string })?.url : undefined,
          }))
          return (
            <ServiceProcessSection
              eyebrow={String(cmsProcess?.eyebrow || 'Our process')}
              title={String(cmsProcess?.heading || process?.title || 'We make it easy for you')}
              description={String(cmsProcess?.description || process?.description || '')}
              steps={mappedSteps}
            />
          )
        }
        return process ? <ServiceProcessSection {...process} /> : null
      })(),
    },
    { key: 'gallery', node: sections.gallery ? <ServiceGallery service={service} /> : null },
    {
      key: 'craftsmanship',
      node: (() => {
        if (!sections.craftsmanship) return null
        const cmsCraft = service.sections?.find((s) => s.blockType === 'craftsmanship') as Record<string, unknown> | undefined
        const defaultContent = getCraftsmanshipContent(service)
        if (cmsCraft) {
          const bodyText = typeof cmsCraft.description === 'string' ? cmsCraft.description : ''
          return (
            <ServiceCraftsmanshipTransformsSection
              eyebrow={String(cmsCraft.eyebrow || defaultContent.eyebrow)}
              heading="Craftsmanship That"
              headingAccent="Transforms"
              body={bodyText ? [bodyText] : defaultContent.body}
              images={defaultContent.images}
              cta={defaultContent.cta}
            />
          )
        }
        return <ServiceCraftsmanshipTransformsSection {...defaultContent} />
      })(),
    },
    { key: 'service-areas', node: <ServiceAreasSection service={service} /> },
    {
      key: 'quote',
      node:
        sections.quote && cmsQuote && cmsQuote.blockType === 'quote' ? (
          <ServiceQuoteSection
            heading="Our promise"
            quote={cmsQuote.quote}
            attribution={cmsQuote.attribution || 'Prime Design & Build'}
            image={service.image}
          />
        ) : sections.quote && fallbackQuote ? (
          <ServiceQuoteSection {...fallbackQuote} />
        ) : null,
    },
    { key: 'faq', node: sections.faq ? <ServiceFaq slug={service.slug} /> : null },
    { key: 'estimate', node: sections.estimate ? <ServiceEstimateCta /> : null },
    {
      key: 'silicon-valley-loves',
      node: sections.siliconValleyLoves ? <ServiceSiliconValleyLovesSection /> : null,
    },
    { key: 'reviews', node: sections.reviews ? <ProjectsReviews /> : null },
    { key: 'contact', node: sections.contact ? <ContactSection /> : null },
  ]
  const orderedSections = sectionNodes
    .filter(({ node }) => node !== null)
    .sort((a, b) => {
      const aIndex = order.indexOf(a.key)
      const bIndex = order.indexOf(b.key)
      return (aIndex < 0 ? order.length : aIndex) - (bIndex < 0 ? order.length : bIndex)
    })

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <ServiceHero service={service} />
        {sections.videoFirst ? <div>{videoSection}</div> : null}
        {orderedSections.map(({ key, node }) => (
          <div key={key}>{node}</div>
        ))}
      </main>
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}

export const ServiceDetailPage = ServiceTemplate
