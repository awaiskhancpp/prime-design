import { Fragment, type ReactNode } from 'react'
import { Contact as GalleryContact } from '@/components/gallery/Contact'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import type { ServiceDetail } from '@/lib/services'
import { ServiceProcessSection } from './ServiceProcessSection'
import { ServiceOfferingsSection } from './ServiceOfferingsSection'
import { ServiceVideoSection } from './ServiceVideoSection'
import { HomeRemodelingProcessSection } from './sections/HomeRemodelingProcessSection'
import { ServiceAreasSection } from './ServiceAreasSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaqLoader } from './ServiceFaqLoader'
import { ServiceGallery } from './ServiceGallery'
import { ServiceImageTextSection } from './sections/ServiceImageTextSection'
import { ServiceQuoteSection } from './ServiceQuoteSection'
import { ServiceCraftsmanshipTransformsSection } from './sections/ServiceCraftsmanshipTransformsSection'
import { ServiceHomeRepairCategoriesSection, type HomeRepairCategory } from './sections/ServiceHomeRepairCategoriesSection'
import { ServiceWhyChooseUsSection } from './sections/ServiceWhyChooseUsSection'
import { ServiceRealHomesStoriesSection } from './sections/ServiceRealHomesStoriesSection'
import {
  getWordPressDifferenceContent,
  ServicePrimeDifferenceSection,
} from './sections/ServicePrimeDifferenceSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { ServiceLicensedInsuredSection } from './sections/ServiceLicensedInsuredSection'
import { ServiceFinanceCtaSection } from './sections/ServiceFinanceCtaSection'
import { ServiceFinanceProcessSection } from './sections/ServiceFinanceProcessSection'
import { mediaUrl, sharedSectionRegistry, text } from '@/components/landing/LandingBlockRenderer'
import type { RichTextValue } from '@/lib/richText'
import type { CarouselVideo } from '@/components/landing/VideoCarousel'
import type { ComponentType } from 'react'

/** A single CMS section block, in its raw (untyped) payload shape. */
type RawBlock = Record<string, unknown>

/** A section renderer's result: the element plus the React key to use. */
export type RenderedSection = { key: string; node: ReactNode }

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
    // WordPress icon (SVG) preserved on the block — falls back to the
    // built-in per-position icons when the source had none.
    icon: str((feature.icon as RawBlock | undefined)?.sourceSvgUrl) || undefined,
  }))
  const checklist = blocks(block.checklist)
    .map((item) => str(item.text))
    .filter((item): item is string => Boolean(item))
  const socials = blocks(block.socials)
    .map((social) => ({ image: str(social.image), href: str(social.url) }))
    .filter((social) => social.image)
  const content = getWordPressDifferenceContent({
    eyebrow: str(block.eyebrow),
    heading: headingText || 'The Prime Difference',
    description: str(block.description),
    features,
    checklist,
  })
  content.socials = socials.length ? socials : undefined
  const videos: CarouselVideo[] = blocks(block.videos)
    .map((video) => ({
      url: str(video.externalUrl) || mediaUrl(video.video) || '',
      poster: mediaUrl(video.poster),
      caption: str(video.caption),
    }))
    .filter((video) => video.url)
  return {
    key: 'prime-difference',
    node: <ServicePrimeDifferenceSection {...content} videos={videos} />,
  }
}

/** `experience-difference` — "Why Choose Prime Design & Build?" grid. */
function renderWhyChooseUs(block: RawBlock, headingText: string): RenderedSection {
  const features = blocks(block.features)
    .map((feature) => ({ title: str(feature.title), description: str(feature.description) }))
    .filter((item) => item.title)
  return {
    key: 'why-choose-us',
    node: (
      <ServiceWhyChooseUsSection heading={headingText || ''} items={features} />
    ),
  }
}

/** `craftsmanship` — "Craftsmanship That Transforms" split-image section. */
function renderCraftsmanship(block: RawBlock, service: ServiceDetail): RenderedSection {
  const image = mediaUrl(block.media) || mediaUrl(block.image)
  const images: [string, string] = image
    ? [image, service.image]
    : [service.image, service.image]
  const bodyText = str(block.description) || str(block.body)

  return {
    key: 'craftsmanship',
    node: (
      <ServiceCraftsmanshipTransformsSection
        eyebrow={str(block.eyebrow) || ''}
        heading="Craftsmanship That"
        headingAccent="Transforms"
        body={bodyText ? [bodyText] : []}
        images={images}
        cta={{ label: 'Free on-site estimate', href: '/contact' }}
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
): RenderedSection | null {
  const useBespokeProcess =
    service.slug === 'home-remodeling' ||
    service.slug === 'complete-renovation' ||
    headingLower.includes('client-centered')

  if (useBespokeProcess) {
    const steps = blocks(block.steps).map((step, stepIndex) => ({
      title: str(step.title) || `Step ${stepIndex + 1}`,
      description: str(step.description),
      image: mediaUrl(step.image),
    }))
    if (!steps.length) return null
    return {
      key: 'process',
      node: (
        <HomeRemodelingProcessSection
          title={headingText || ''}
          description={str(block.description) || ''}
          steps={steps}
        />
      ),
    }
  }

  const steps = blocks(block.steps).map((step, stepIndex) => ({
    title: str(step.title) || `Step ${stepIndex + 1}`,
    description: str(step.description),
    image: mediaUrl(step.image),
  }))

  return {
    key: 'process',
    node: (
      <ServiceProcessSection
        eyebrow={str(block.eyebrow)}
        title={headingText || ''}
        description={str(block.description) || ''}
        steps={steps}
      />
    ),
  }
}

/** `quote` — "Our promise" pull-quote with portrait. */
function renderQuote(
  block: RawBlock,
  headingText: string,
  service: ServiceDetail,
): RenderedSection {
  return {
    key: 'quote',
    node: (
      <ServiceQuoteSection
        heading={headingText || ''}
        quote={str(block.quote) || str(block.description) || ''}
        attribution={str(block.attribution) || ''}
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
        body: str(item.body),
        label: str(item.label),
        features: blocks(item.features)
          .map((feature) => str(feature.text))
          .filter((text): text is string => Boolean(text)),
        image: mediaUrl(item.media) || service.image,
        href: str(link?.url) || '/contact',
      }
    })
    .filter((card) => card.title)
  if (!cards.length) return null

  // The European and Shaker Kitchen pages render their feature cards through
  // the home-repair categories design (alternating image/text rows) with the
  // section header the WordPress page authored above them. Each card's
  // WordPress accent heading renders as the card's eyebrow above its heading.
  // The European cards keep their bullet lists (plus italic lead-in labels);
  // the Shaker cards carry paragraph bodies instead.
  if (
    service.slug === 'european-kitchen-silicon-valley' ||
    service.slug === 'shaker-kitchen-silicon-valley'
  ) {
    const categories = cards.map((card) => ({
      eyebrow: card.description,
      title: card.title,
      label: card.label,
      image: card.image,
      body: card.body || '',
      items: card.features,
    }))
    return {
      key: 'repair-services',
      node: (
        <ServiceHomeRepairCategoriesSection
          eyebrow={str(block.eyebrow) || undefined}
          heading={headingText || undefined}
          description={str(block.description) || undefined}
          categories={categories}
        />
      ),
    }
  }

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
    label: str(category.label) || 'Includes:',
    image: mediaUrl(category.media) || service.image,
    // Rich text (Lexical) from Payload — the section renders it with the
    // card's own typography.
    body: (category.description as HomeRepairCategory['body']) || '',
    items: blocks(category.features)
      .map((feature) => str(feature.text))
      .filter((item): item is string => Boolean(item)),
    closingBody: category.closingBody as HomeRepairCategory['closingBody'],
  }))
  if (!categories.length) return null
  return {
    key: 'repair-services',
    node: <ServiceHomeRepairCategoriesSection categories={categories} />,
  }
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
        title={headingText || undefined}
        description={str(block.description)}
        videoUrl={videoUrl}
        poster={mediaUrl(block.poster)}
      />
    ),
  }
}

/**
 * `cta` — the Finance "One-Stop Hub" section: heading + body + button at the
 * end, with the WordPress image on the right (the Finance-Prime-Kitchens
 * image). Rendered through the shared registry so it keeps its page position.
 */
function renderFinanceHub(block: RawBlock): RenderedSection {
  const ctaButton = blocks(block.buttons).find(
    (item) => Boolean(item && typeof item === 'object' && str((item as RawBlock).label)),
  ) as RawBlock | undefined
  return {
    key: 'shared-registry',
    node: (
      <ServiceImageTextSection
        heading={str(block.heading)}
        description={str(block.description) || undefined}
        image={mediaUrl(block.media)}
        imageSide="right"
        cta={
          ctaButton
            ? { label: str(ctaButton.label), href: str(ctaButton.url) || '/contact' }
            : undefined
        }
      />
    ),
  }
}

/**
 * `cta` — the Finance "Let's work together to finance your renovation"
 * section: the WordPress centered-content design over the block's
 * background image with the dark shade overlay.
 */
function renderFinanceCta(block: RawBlock): RenderedSection {
  const ctaButton = blocks(block.buttons).find(
    (item) => Boolean(item && typeof item === 'object' && str((item as RawBlock).label)),
  ) as RawBlock | undefined
  return {
    key: 'shared-registry',
    node: (
      <ServiceFinanceCtaSection
        heading={str(block.heading)}
        description={str(block.description) || undefined}
        image={mediaUrl(block.media)}
        cta={
          ctaButton
            ? { label: str(ctaButton.label), href: str(ctaButton.url) || '/contact' }
            : undefined
        }
      />
    ),
  }
}

/**
 * `image-text` — the Finance "Renovation financing, simplified." process
 * section: heading + phone image + rich-text body/ordered steps on the
 * left, the phone image on the right (the WordPress two-column design).
 */
function renderFinanceProcess(block: RawBlock): RenderedSection {
  const content = block.description
  return {
    key: 'shared-registry',
    node: (
      <ServiceFinanceProcessSection
        heading={str(block.heading)}
        content={
          content && typeof content === 'object' ? (content as RichTextValue) : undefined
        }
        image={mediaUrl(block.media)}
      />
    ),
  }
}

/**
 * `experience-difference` on the Finance page — "Pick a company you can
 * trust": Licensed / Bonded / Insured icon cards (SVGs from the block's
 * feature icons, uploaded to /public).
 */
function renderLicensedInsured(block: RawBlock): RenderedSection {
  const items = blocks(block.features)
    .map((feature) => ({
      title: str(feature.title),
      icon: str((feature.icon as RawBlock | undefined)?.sourceSvgUrl) || undefined,
    }))
    .filter((item) => item.title)
  return {
    key: 'shared-registry',
    node: (
      <ServiceLicensedInsuredSection
        heading={str(block.heading) || 'Pick a company you can trust'}
        description={str(block.description) || undefined}
        items={items}
      />
    ),
  }
}

/**
 * Resolve one CMS section block to its Service-section design. Returns null
 * when nothing bespoke applies, so the caller can try the shared landing
 * registry.
 *
 * `ContactComponent` lets callers control which contact form the CMS
 * `contact-form`/`booking`/`form` block renders — it must be the same
 * component `ServiceTemplate` uses for the static fallback (driven by
 * `sections.contactVariant`), or the two paths silently disagree the way
 * the hardcoded `<HomeContact />` used to.
 *
 * `singletonKeys` tracks already-rendered one-per-page sections (contact,
 * gallery, FAQ, service areas) so migrated content that repeats them does
 * not produce duplicates.
 */
export function renderSection(
  rawSection: object,
  service: ServiceDetail,
  singletonKeys: Set<string>,
  ContactComponent: ComponentType = GalleryContact,
): RenderedSection | null {
  const block = rawSection as RawBlock
  const blockType = block.blockType
  const headingText = str(block.heading)
  const headingLower = headingText.toLowerCase()

  const isImageText = blockType === 'image-text'

  // The European Kitchen page replaces the standard Prime Difference design
  // with the bespoke "Why Choose Prime Kitchens?" three-card section (from
  // the service's `primeKitchens` group), so its legacy block renders nothing.
  if (
    blockType === 'prime-difference' &&
    service.slug === 'european-kitchen-silicon-valley'
  ) {
    return null
  }

  if (blockType === 'prime-difference') return renderPrimeDifference(block, headingText)

  if (blockType === 'experience-difference' && service.slug === 'finance') {
    return renderLicensedInsured(block)
  }

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

  if (
    blockType === 'silicon-valley-loves' ||
    (isImageText && headingLower.includes('silicon valley loves'))
  ) {
    // Payload block content only — the section renders nothing without it.
    return {
      key: 'silicon-valley-loves',
      node: (
        <ServiceSiliconValleyLovesSection
          content={{
            eyebrow: str(block.eyebrow) || undefined,
            heading: headingText || undefined,
            body: str(block.description) || undefined,
            image: mediaUrl(block.media) || mediaUrl(block.image) || undefined,
          }}
        />
      ),
    }
  }

  if (
    blockType === 'quote' ||
    (isImageText &&
      (headingLower.includes('our promise') || headingLower.includes('crafting your dream home')))
  ) {
    return renderQuote(block, headingText, service)
  }

  // The Finance process section ("Renovation financing, simplified.") has
  // its own WordPress two-column design with rich-text steps.
  if (isImageText && headingLower.includes('renovation financing')) {
    return renderFinanceProcess(block)
  }

  // Generic image + text (e.g. the "Home Additions - Enhancing Your Living
  // Space" block) — rendered by the dedicated rich-text image-text section so
  // the WordPress bullet copy displays as a proper list, not raw text.
  if (isImageText) {
    const image = mediaUrl(block.media)
    const buttons = Array.isArray(block.buttons) ? block.buttons : []
    const ctaButton = buttons.find(
      (item): item is Record<string, unknown> =>
        Boolean(item && typeof item === 'object' && str((item as Record<string, unknown>).label)),
    )
    return {
      key: 'shared-registry',
      node: (
        <ServiceImageTextSection
          eyebrow={str(block.eyebrow) || undefined}
          heading={headingText}
          description={str(block.description) || undefined}
          image={image}
          imageSide={str(block.alignment) || undefined}
          cta={
            ctaButton
              ? {
                  label: str(ctaButton.label),
                  href: str(ctaButton.url) || '#contact',
                }
              : undefined
          }
        />
      ),
    }
  }

  if (blockType === 'sub-services') return renderOfferings(block, headingText, service)

  if (blockType === 'repair-services') return renderRepairCategories(block, service)

  if (blockType === 'landing-testimonials' || blockType === 'testimonials') {
    return renderTestimonials(block, headingText, blockType)
  }

  if (blockType === 'cta' && headingLower.includes('one-stop hub')) {
    return renderFinanceHub(block)
  }

  if (blockType === 'cta' && headingLower.includes("let's work together")) {
    return renderFinanceCta(block)
  }

  if (
    blockType === 'cta' &&
    (headingLower.includes('estimate') ||
      headingLower.includes('schedule') ||
      headingLower.includes('get started'))
  ) {
    return {
      key: 'estimate-cta',
      node: (
        <ServiceEstimateCta
          heading={headingText || undefined}
          description={str(block.description) || undefined}
        />
      ),
    }
  }

  if (blockType === 'contact-form' || blockType === 'booking' || blockType === 'form') {
    if (singletonKeys.has('service-contact')) return null
    singletonKeys.add('service-contact')
    return { key: 'service-contact', node: <ContactComponent /> }
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

  const Renderer = sharedSectionRegistry[blockType as string]
  if (Renderer) {
    return { key: 'shared-registry', node: <Renderer block={rawSection as never} /> }
  }
  return null
}

export function ServiceSectionRenderer({
  sections,
  service,
  ContactComponent,
}: {
  sections: NonNullable<ServiceDetail['sections']>
  service: ServiceDetail
  ContactComponent?: ComponentType
}) {
  const rendered: ReactNode[] = []
  const singletonKeys = new Set<string>()
  let index = 0

  for (const rawSection of sections) {
    const result = renderSection(rawSection, service, singletonKeys, ContactComponent)
    if (result) {
      rendered.push(<Fragment key={`${result.key}-${index++}`}>{result.node}</Fragment>)
    }
  }

  return <>{rendered}</>
}
