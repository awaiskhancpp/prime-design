import { Fragment, type ReactNode } from 'react'
import { HomeContact } from '@/components/blocks/HomeContact'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import type { ServiceDetail } from '@/lib/services'
import { getServiceProcess, ServiceProcessSection } from './ServiceProcessSection'
import { ServiceOfferingsSection } from './ServiceOfferingsSection'
import { ServiceVideoSection } from './ServiceVideoSection'
import { HomeRemodelingProcessSection } from './sections/HomeRemodelingProcessSection'
import { ServiceAreasSection } from './ServiceAreasSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaqLoader } from './ServiceFaqLoader'
import { ServiceGallery } from './ServiceGallery'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import {
  getCraftsmanshipContent,
  ServiceCraftsmanshipTransformsSection,
} from './sections/ServiceCraftsmanshipTransformsSection'
import { ServiceHomeRepairCategoriesSection } from './sections/ServiceHomeRepairCategoriesSection'
import { ServiceWhyChooseUsSection } from './sections/ServiceWhyChooseUsSection'
import { ServiceRealHomesStoriesSection } from './sections/ServiceRealHomesStoriesSection'
import {
  getWordPressDifferenceContent,
  ServicePrimeDifferenceSection,
} from './sections/ServicePrimeDifferenceSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { mediaUrl, sharedSectionRegistry, text } from '@/components/landing/LandingBlockRenderer'
import type { CarouselVideo } from '@/components/landing/VideoCarousel'

/**
 * Renders the CMS "Page Builder" sections of a service (the WordPress-derived
 * blocks the editor maintains in Payload) in their exact CMS order.
 *
 * Each block type maps to the bespoke, hand-designed Service section
 * component for that content type wherever one exists — so migrated
 * WordPress data renders through this site's actual designed service-page
 * components instead of the generic landing-page versions. Block types with
 * no dedicated Service design (before-after, find-us, video-carousel,
 * gallery-carousel, project-grid, ...) fall back to the shared landing
 * registry at the bottom, which already has a finished design for each.
 *
 * Legacy content often arrived as generic `image-text` blocks; several
 * branches below also match on heading keywords ("Craftsmanship", "Our
 * promise", ...) so that old data still renders as the intended section.
 */

/** A single CMS section block, in its raw (untyped) payload shape. */
type RawBlock = Record<string, unknown>

/** A section renderer's result: the element plus the React key to use. */
type RenderedSection = { key: string; node: ReactNode }

/** Coerce a block field to a plain string (handles rich-text arrays). */
function str(value: unknown): string {
  return text(value) || ''
}

/** Coerce a block field to an array of raw blocks. */
function blocks(value: unknown): RawBlock[] {
  return Array.isArray(value) ? (value as RawBlock[]) : []
}

/** `prime-difference` — the "Prime Difference" features + video carousel. */
function renderPrimeDifference(block: RawBlock, headingText: string): RenderedSection {
  const features = blocks(block.features).map((feature) => ({
    title: str(feature.title),
    description: str(feature.description),
  }))
  const content = getWordPressDifferenceContent({
    eyebrow: str(block.eyebrow),
    heading: headingText || 'The Prime Difference',
    description: str(block.description),
    features,
  })
  const videos: CarouselVideo[] = blocks(block.videos)
    .map((video) => ({
      url: str(video.externalUrl) || mediaUrl(video.video) || '',
      poster: mediaUrl(video.poster),
      caption: str(video.caption),
    }))
    .filter((video) => video.url)
  return { key: 'prime-difference', node: <ServicePrimeDifferenceSection {...content} videos={videos} /> }
}

/** `experience-difference` — "Why Choose Prime Design & Build?" grid. */
function renderWhyChooseUs(block: RawBlock, headingText: string): RenderedSection {
  const features = blocks(block.features)
    .map((feature) => ({ title: str(feature.title), description: str(feature.description) }))
    .filter((item) => item.title)
  return {
    key: 'why-choose-us',
    node: (
      <ServiceWhyChooseUsSection
        heading={headingText || 'Why Choose Prime Design & Build?'}
        items={features.length ? features : undefined}
      />
    ),
  }
}

/** `craftsmanship` — "Craftsmanship That Transforms" split-image section. */
function renderCraftsmanship(block: RawBlock, service: ServiceDetail): RenderedSection {
  // CMS copy overrides the curated defaults piece by piece; anything the
  // editor left blank falls back to the default content.
  const defaultContent = getCraftsmanshipContent(service)
  const image = mediaUrl(block.media) || mediaUrl(block.image)
  const images: [string, string] = image
    ? [image, defaultContent.images[1] || service.image]
    : defaultContent.images
  const bodyText = str(block.description) || str(block.body)

  return {
    key: 'craftsmanship',
    node: (
      <ServiceCraftsmanshipTransformsSection
        eyebrow={str(block.eyebrow) || defaultContent.eyebrow}
        heading="Craftsmanship That"
        headingAccent="Transforms"
        body={bodyText ? [bodyText] : defaultContent.body}
        images={images}
        cta={defaultContent.cta}
      />
    ),
  }
}

/** `process` — numbered steps, or the bespoke home-remodeling walkthrough. */
function renderProcess(
  block: RawBlock,
  headingText: string,
  headingLower: string,
  service: ServiceDetail,
): RenderedSection {
  // The home-remodeling / complete-renovation pages — and any copy titled
  // "client-centered ..." — use the bespoke multi-step design instead of
  // the generic numbered steps.
  const useBespokeProcess =
    service.slug === 'home-remodeling' ||
    service.slug === 'complete-renovation' ||
    headingLower.includes('client-centered')

  if (useBespokeProcess) {
    return { key: 'process', node: <HomeRemodelingProcessSection /> }
  }

  const steps = blocks(block.steps).map((step, stepIndex) => ({
    title: str(step.title) || `Step ${stepIndex + 1}`,
    description: str(step.description),
    image: mediaUrl(step.image),
  }))
  const fallbackProcess = getServiceProcess(service)

  return {
    key: 'process',
    node: (
      <ServiceProcessSection
        eyebrow={str(block.eyebrow) || 'Our process'}
        title={headingText || fallbackProcess?.title || 'We make it easy for you'}
        description={str(block.description) || fallbackProcess?.description}
        steps={steps.length ? steps : (fallbackProcess?.steps ?? [])}
      />
    ),
  }
}

/** `quote` — "Our promise" pull-quote with portrait. */
function renderQuote(block: RawBlock, headingText: string, service: ServiceDetail): RenderedSection {
  const fallbackQuote = getServiceQuote(service.slug)
  return {
    key: 'quote',
    node: (
      <ServiceQuoteSection
        heading={headingText || fallbackQuote?.heading || 'Crafting your dream home, our promise'}
        quote={str(block.quote) || str(block.description) || fallbackQuote?.quote || ''}
        attribution={
          str(block.attribution) ||
          fallbackQuote?.attribution ||
          'Noah, Co-founder of Prime Design & Build'
        }
        image={mediaUrl(block.media) || mediaUrl(block.image) || service.image}
      />
    ),
  }
}

/** `sub-services` — cards linking to related offerings. */
function renderOfferings(
  block: RawBlock,
  headingText: string,
  service: ServiceDetail,
): RenderedSection | null {
  const cards = blocks(block.items)
    .map((item) => {
      const link = item.link as RawBlock | undefined
      return {
        title: str(item.title),
        description: str(item.description),
        image: mediaUrl(item.media) || service.image,
        href: str(link?.url) || '/contact',
      }
    })
    .filter((card) => card.title)
  // No usable cards → let the shared landing registry try this block type.
  if (!cards.length) return null
  return {
    key: 'sub-services',
    node: (
      <ServiceOfferingsSection
        eyebrow={str(block.eyebrow)}
        title={headingText || 'Our Services'}
        description={str(block.description)}
        cards={cards}
      />
    ),
  }
}

/** `repair-services` — home-repair category cards with feature lists. */
function renderRepairCategories(block: RawBlock, service: ServiceDetail): RenderedSection | null {
  const categories = blocks(block.categories).map((category) => ({
    title: str(category.title) || 'Service',
    label: str(category.heading) || 'Includes:',
    image: mediaUrl(category.media) || service.image,
    body: str(category.description),
    items: blocks(category.features)
      .map((feature) => str(feature.text))
      .filter((item): item is string => Boolean(item)),
  }))
  if (!categories.length) return null
  return { key: 'repair-services', node: <ServiceHomeRepairCategoriesSection categories={categories} /> }
}

/**
 * `landing-testimonials` / `testimonials` — either the "Real Homes, Real
 * Stories" design (when the block carries usable reviews) or the projects
 * reviews carousel. Returns null when the shared registry should handle it.
 */
function renderTestimonials(
  block: RawBlock,
  headingText: string,
  blockType: string,
): RenderedSection | null {
  // Review rows are nested per review-provider; flatten to the reviews.
  const testimonials = blocks(block.providers)
    .flatMap((provider) => blocks(provider.reviews))
    .map((review) => ({
      quote: str(review.body),
      attribution: str(review.reviewer) || 'Prime Design & Build client',
    }))
    .filter((item) => item.quote)
    .slice(0, 3)

  if (testimonials.length) {
    return {
      key: 'real-homes',
      node: (
        <ServiceRealHomesStoriesSection
          eyebrow={str(block.eyebrow) || '#1 Home Remodeling Company in Silicon Valley'}
          heading={headingText || 'Real Homes,'}
          headingAccent="Real Stories"
          description={
            str(block.description) ||
            'Explore the success stories of homeowners who entrusted Prime Design & Build.'
          }
          testimonials={testimonials}
          cta={{ label: 'Contact us now', href: '/contact' }}
        />
      ),
    }
  }
  if (blockType === 'testimonials') {
    return { key: 'reviews', node: <ProjectsReviews /> }
  }
  return null
}

/** `video` — embedded video section (only when a URL resolves). */
function renderVideo(block: RawBlock, headingText: string): RenderedSection | null {
  const videoUrl = str(block.externalUrl) || mediaUrl(block.video)
  if (!videoUrl) return null
  return {
    key: 'video',
    node: (
      <ServiceVideoSection
        eyebrow={str(block.eyebrow)}
        title={headingText || 'See the difference'}
        description={str(block.description)}
        videoUrl={videoUrl}
        poster={mediaUrl(block.poster)}
      />
    ),
  }
}

/**
 * Resolve one CMS section block to its Service-section design. Returns null
 * when nothing bespoke applies, so the caller can try the shared landing
 * registry.
 *
 * `singletonKeys` tracks already-rendered one-per-page sections (contact,
 * gallery, FAQ, service areas) so migrated content that repeats them does
 * not produce duplicates.
 */
function renderSection(
  rawSection: object,
  service: ServiceDetail,
  singletonKeys: Set<string>,
): RenderedSection | null {
  const block = rawSection as RawBlock
  const blockType = block.blockType
  const headingText = str(block.heading)
  const headingLower = headingText.toLowerCase()

  // Legacy `image-text` blocks are re-routed to their real section design
  // when the heading gives away what the block was meant to be.
  const isImageText = blockType === 'image-text'

  if (blockType === 'prime-difference') return renderPrimeDifference(block, headingText)

  if (blockType === 'experience-difference') return renderWhyChooseUs(block, headingText)

  if (blockType === 'craftsmanship' || (isImageText && headingLower.includes('craftsmanship'))) {
    return renderCraftsmanship(block, service)
  }

  if (
    blockType === 'process' ||
    (isImageText && (headingLower.includes('client-centered') || headingLower.includes('process')))
  ) {
    return renderProcess(block, headingText, headingLower, service)
  }

  if (blockType === 'silicon-valley-loves' || (isImageText && headingLower.includes('silicon valley loves'))) {
    return { key: 'silicon-valley-loves', node: <ServiceSiliconValleyLovesSection /> }
  }

  if (
    blockType === 'quote' ||
    (isImageText &&
      (headingLower.includes('our promise') || headingLower.includes('crafting your dream home')))
  ) {
    return renderQuote(block, headingText, service)
  }

  if (blockType === 'sub-services') return renderOfferings(block, headingText, service)

  if (blockType === 'repair-services') return renderRepairCategories(block, service)

  if (blockType === 'landing-testimonials' || blockType === 'testimonials') {
    return renderTestimonials(block, headingText, blockType)
  }

  if (
    blockType === 'cta' &&
    (headingLower.includes('estimate') ||
      headingLower.includes('schedule') ||
      headingLower.includes('get started'))
  ) {
    return { key: 'estimate-cta', node: <ServiceEstimateCta /> }
  }

  // One-per-page sections: skip repeats of a section already rendered.
  if (blockType === 'contact-form' || blockType === 'booking' || blockType === 'form') {
    if (singletonKeys.has('service-contact')) return null
    singletonKeys.add('service-contact')
    return { key: 'service-contact', node: <HomeContact /> }
  }

  if (blockType === 'gallery') {
    if (singletonKeys.has('service-gallery')) return null
    singletonKeys.add('service-gallery')
    return { key: 'service-gallery', node: <ServiceGallery service={service} /> }
  }

  if (blockType === 'faq') {
    if (singletonKeys.has('service-faq')) return null
    singletonKeys.add('service-faq')
    return { key: 'service-faq', node: <ServiceFaqLoader slug={service.slug} /> }
  }

  if (blockType === 'service-areas') {
    if (singletonKeys.has('service-areas')) return null
    singletonKeys.add('service-areas')
    return { key: 'service-areas', node: <ServiceAreasSection service={service} /> }
  }

  if (blockType === 'video') return renderVideo(block, headingText)

  // No bespoke Service design for this block type — use the shared landing
  // registry's version, which is a real, finished design too (the hero is
  // handled separately and excluded before this renderer ever runs).
  const Renderer = sharedSectionRegistry[blockType as string]
  if (Renderer) {
    return { key: 'shared-registry', node: <Renderer block={rawSection as never} /> }
  }
  return null
}

export function ServiceSectionRenderer({
  sections,
  service,
}: {
  sections: NonNullable<ServiceDetail['sections']>
  service: ServiceDetail
}) {
  const rendered: ReactNode[] = []
  const singletonKeys = new Set<string>()
  let index = 0

  for (const rawSection of sections) {
    const result = renderSection(rawSection, service, singletonKeys)
    if (result) {
      // Key by position so repeated sections of the same type stay distinct.
      rendered.push(<Fragment key={`${result.key}-${index++}`}>{result.node}</Fragment>)
    }
  }

  return <>{rendered}</>
}
