import type { ReactNode } from 'react'
import { HomeContact } from '@/components/blocks/HomeContact'
import { Contact as GalleryContact } from '@/components/gallery/Contact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import type { ServiceDetail } from '@/lib/services'

// Section components + their curated per-slug content helpers.
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getServiceProcess, ServiceProcessSection } from './ServiceProcessSection'
import { getServiceVideo, ServiceVideoSection } from './ServiceVideoSection'
import { HomeRemodelingProcessSection } from './sections/HomeRemodelingProcessSection'
import {
  ServiceHomeRepairCategoriesSection,
  homeRepairCategoriesContent,
} from './sections/ServiceHomeRepairCategoriesSection'
import { ServiceWhyChooseUsSection } from './sections/ServiceWhyChooseUsSection'
import {
  getRealHomesContent,
  ServiceRealHomesStoriesSection,
} from './sections/ServiceRealHomesStoriesSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaqLoader } from './ServiceFaqLoader'
import { ReviewsSection } from './ReviewsSection'
import { ServiceGallery } from './ServiceGallery'
import { ServiceHero } from './ServiceHero'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import {
  getCraftsmanshipContent,
  ServiceCraftsmanshipTransformsSection,
} from './sections/ServiceCraftsmanshipTransformsSection'

// Extracted building blocks (see each file for details).
import { getServicePageSections } from './servicePageLayout'
import { ServiceOverview } from './ServiceOverview'
import { ServiceContentBlocks } from './ServiceContentBlocks'
import { ServiceSectionRenderer } from './ServiceSectionRenderer'
import { ServiceAreasSection } from './ServiceAreasSection'

/**
 * SERVICE DETAIL PAGE — orchestrator.
 *
 * A service page is assembled from three content sources, in this priority:
 *
 *   1. CMS "Page Builder" sections (`service.sections`) — WordPress-derived
 *      blocks the editor maintains in Payload. Rendered in exact CMS order
 *      by `ServiceSectionRenderer`.
 *   2. Curated "Page Content" blocks (`service.contentBlocks`) — rendered by
 *      `ServiceContentBlocks`.
 *   3. A static per-slug layout (flags from `servicePageLayout.ts`) with
 *      hand-curated content helpers (`getServiceVideo`, `getServiceQuote`,
 *      ...). Used for section types the CMS has not authored, so nothing
 *      that was showing ever disappears.
 *
 * The two CMS sources suppress the static section of the same type (no
 * double rendering), and `service.sectionOrder` from the CMS controls the
 * final section order (falling back to `FALLBACK_SECTION_ORDER`).
 */

/** Default section order when the CMS does not provide `sectionOrder`. */
const FALLBACK_SECTION_ORDER = [
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
] as const

/**
 * Render the service page shell: header, hero, the ordered section stack,
 * and footer. This is the component every service route renders.
 */
export function ServiceTemplate({ service }: { service: ServiceDetail }) {
  // ---- 1. Resolve layout flags and curated content ----------------------

  const sections = getServicePageSections(service.slug)
  // Verified against the real WordPress export: the gallery-variant contact
  // form is only used by pages that only ever existed at `-silicon-valley`
  // suffixed slugs.
  const ContactSection = sections.contactVariant === 'gallery' ? GalleryContact : HomeContact

  const offerings = getServiceOfferings(service.slug)
  const process = getServiceProcess(service)
  const fallbackQuote = getServiceQuote(service.slug)
  const fallbackVideo = sections.video ? getServiceVideo(service.slug) : undefined

  // ---- 2. Collect the CMS-authored content ------------------------------

  const hasCmsBlocks = Boolean(service.contentBlocks?.length)
  const cmsQuote = service.contentBlocks?.find((block) => block.blockType === 'quote')
  const cmsVideos = service.contentBlocks?.filter((block) => block.blockType === 'video') ?? []

  // Content blocks whose block type has a dedicated section slot below are
  // excluded here so they cannot render twice (video/process/gallery/quote,
  // and sub-services when the curated offerings section is showing).
  const contentBlocks = service.contentBlocks?.filter((block) => {
    if (
      block.blockType === 'video' ||
      block.blockType === 'process' ||
      block.blockType === 'gallery' ||
      block.blockType === 'quote'
    ) {
      return false
    }
    if (offerings && block.blockType === 'sub-services') return false
    return true
  })

  // Non-hero CMS sections, in Payload order. The hero is excluded because
  // `ServiceHero` always renders it from the service record itself.
  const cmsContentSections = (service.sections ?? []).filter(
    (block) => block && typeof block.blockType === 'string' && block.blockType !== 'hero',
  )
  const hasCmsSections = cmsContentSections.length > 0
  const cmsBlockTypes = new Set(cmsContentSections.map((block) => String(block.blockType)))
  /** True when the CMS has already authored a section of one of these types. */
  const cmsHas = (...types: string[]) => types.some((type) => cmsBlockTypes.has(type))

  // Video section: CMS video blocks win, then the curated per-slug video.
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

  // ---- 3. Build one node per section slot -------------------------------

  // Each slot renders `null` when suppressed: either its layout flag is off,
  // or the CMS already supplies that section type (checked via `cmsHas`) so
  // the static version would duplicate it.
  const sectionNodes: Array<{ key: string; node: ReactNode }> = [
    {
      key: 'intro',
      node:
        !sections.homeRepairCategories &&
        (contentBlocks?.length || !hasCmsBlocks) &&
        // When the CMS supplies the page body as full WordPress-style
        // sections (image+text, sub-services cards, prime-difference), the
        // generic key-features overview would duplicate that content.
        !(hasCmsSections && cmsHas('image-text', 'sub-services', 'prime-difference')) ? (
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
        (sections.homeRepairWhyChooseUs || sections.whyChooseUs) &&
        !(hasCmsSections && cmsHas('prime-difference', 'experience-difference')) ? (
          <ServiceWhyChooseUsSection />
        ) : null,
    },
    {
      key: 'real-homes',
      node:
        sections.realHomes && !(hasCmsSections && cmsHas('landing-testimonials', 'testimonials')) ? (
          <ServiceRealHomesStoriesSection {...getRealHomesContent(service)} />
        ) : null,
    },
    {
      // `videoFirst` layouts render the video above this stack, right
      // after the hero (see the JSX at the bottom).
      key: 'video',
      node: !sections.videoFirst && !(hasCmsSections && cmsHas('video')) ? videoSection : null,
    },
    {
      key: 'offerings',
      node:
        sections.offerings && offerings && !(hasCmsSections && cmsHas('sub-services')) ? (
          <ServiceOfferingsSection {...offerings} />
        ) : null,
    },
    {
      // Process: CMS-authored process blocks render through the CMS body
      // (ServiceSectionRenderer); this slot only shows the static design.
      key: 'process',
      node: (() => {
        if (!sections.process) return null
        if (hasCmsSections && cmsHas('process')) return null
        if (sections.homeProcess) return <HomeRemodelingProcessSection />
        return process ? <ServiceProcessSection {...process} /> : null
      })(),
    },
    {
      key: 'gallery',
      node:
        sections.gallery && !(hasCmsSections && cmsHas('gallery')) ? (
          <ServiceGallery service={service} />
        ) : null,
    },
    {
      // Craftsmanship: same suppression rule as process — a CMS
      // craftsmanship block renders through the CMS body instead.
      key: 'craftsmanship',
      node:
        sections.craftsmanship && !(hasCmsSections && cmsHas('craftsmanship')) ? (
          <ServiceCraftsmanshipTransformsSection {...getCraftsmanshipContent(service)} />
        ) : null,
    },
    {
      key: 'service-areas',
      node: !(hasCmsSections && cmsHas('service-areas')) ? (
        <ServiceAreasSection service={service} />
      ) : null,
    },
    {
      // Quote: CMS quote block (from contentBlocks) wins over curated.
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
    {
      key: 'faq',
      node:
        sections.faq && !(hasCmsSections && cmsHas('faq')) ? (
          <ServiceFaqLoader slug={service.slug} />
        ) : null,
    },
    { key: 'estimate', node: sections.estimate ? <ServiceEstimateCta /> : null },
    {
      key: 'silicon-valley-loves',
      node: sections.siliconValleyLoves ? <ServiceSiliconValleyLovesSection /> : null,
    },
    {
      key: 'reviews',
      node:
        sections.reviews && !(hasCmsSections && cmsHas('testimonials')) ? (
          <ReviewsSection />
        ) : null,
    },
    {
      key: 'contact',
      node:
        sections.contact && !(hasCmsSections && cmsHas('contact-form', 'booking', 'form')) ? (
          <ContactSection />
        ) : null,
    },
    {
      // The full CMS-authored body — every non-hero Payload section, in
      // exact CMS order, through the WordPress→Service component map.
      key: 'cms-body',
      node:
        cmsContentSections.length > 0 ? (
          <ServiceSectionRenderer
            sections={cmsContentSections as NonNullable<ServiceDetail['sections']>}
            service={service}
          />
        ) : null,
    },
  ]

  // ---- 4. Order the sections and render ----------------------------------

  // The CMS order wins when provided; otherwise the fallback order above.
  const order: string[] = service.sectionOrder?.length
    ? service.sectionOrder
    : [...FALLBACK_SECTION_ORDER]

  /** Sort position for a section key (unknown keys sort last). */
  const rank = (key: string) => {
    const index = order.indexOf(key)
    if (index >= 0) return index
    // CMS-authored body sits right after the intro (or early when intro is
    // skipped) so the page follows the section order the editor maintains.
    if (key === 'cms-body') {
      const introIndex = order.indexOf('intro')
      return introIndex < 0 ? 1 : introIndex + 0.5
    }
    return order.length
  }

  const orderedSections = sectionNodes
    .filter(({ node }) => node !== null)
    .sort((a, b) => rank(a.key) - rank(b.key))

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <ServiceHero service={service} />
        {sections.videoFirst && !(hasCmsSections && cmsHas('video')) ? (
          <div>{videoSection}</div>
        ) : null}
        {orderedSections.map(({ key, node }) => (
          <div key={key}>{node}</div>
        ))}
      </main>
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}

/** Backward-compatible alias for the pre-refactor export name. */
export const ServiceDetailPage = ServiceTemplate

// Re-exported for compatibility with older imports that pulled these from
// this file (each now lives in its own module).
export { ServiceContentBlocks } from './ServiceContentBlocks'
export { ServiceSectionRenderer } from './ServiceSectionRenderer'
