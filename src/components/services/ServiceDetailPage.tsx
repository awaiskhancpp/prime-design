import type { ReactNode } from 'react'
import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ServiceAreasStrip } from './ServiceAreasStrip'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { Contact as GalleryContact } from '@/components/gallery/Contact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import type { ServiceDetail } from '@/lib/services'

// Section components + their curated per-slug content helpers.
import { ServiceOfferingsSection } from './ServiceOfferingsSection'
import { ServiceProcessSection } from './ServiceProcessSection'
import { ServiceVideoSection } from './ServiceVideoSection'
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
import { ServicePrimeKitchensSection } from './sections/ServicePrimeKitchensSection'
import { ServiceIconChecklistGallerySection } from './ServiceIconCheckListGallerySection'
import { ServiceImageChecklistSection } from './ServiceImageCheckListSection'
import { MaterialsShowcaseSection } from './MaterialsShowcaseSection'
import { ServiceTestimonialCardsSection } from './sections/ServiceTestimonialCardsSection'
import { ServiceClientApproachSection } from './sections/ServiceClientApproachSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaqLoader } from './ServiceFaqLoader'
import { ReviewsSection } from './ReviewsSection'
import { ServiceGallery } from './ServiceGallery'
import { ServiceHero } from './ServiceHero'
import { ServiceQuoteSection } from './ServiceQuoteSection'
import { ServiceCraftsmanshipTransformsSection } from './sections/ServiceCraftsmanshipTransformsSection'

// Extracted building blocks (see each file for details).
import { getServicePageSections } from './servicePageLayout'
import { ServiceOverview } from './ServiceOverview'
import { ServiceContentBlocks } from './ServiceContentBlocks'
import {
  ServiceSectionRenderer,
  renderSection,
  type RenderedSection,
} from './ServiceSectionRenderer'
import { ServiceAreasSection } from './ServiceAreasSection'

/**
 * SERVICE DETAIL PAGE — orchestrator.
 *
 * A service page is assembled from three content sources, in this priority:
 *
 *   1. CMS "Page Builder" sections (`service.sections`) — WordPress-derived
 *      blocks the editor maintains in Payload. Each block is resolved via
 *      `renderSection` to its bespoke Service design (or the shared landing
 *      registry when no bespoke design exists) and placed in that section's
 *      real position from `FALLBACK_SECTION_ORDER` — not bundled into one
 *      undifferentiated clump. Only block types `renderSection` cannot
 *      resolve at all land in the small residual `cms-body` slot.
 *   2. Curated "Page Content" blocks (`service.contentBlocks`) — rendered by
 *      `ServiceContentBlocks`.
 *   3. A static per-slug layout (flags from `servicePageLayout.ts`) with
 *      hand-curated content helpers (`getServiceVideo`, `getServiceQuote`,
 *      ...). Used for section types the CMS has not authored, so nothing
 *      that was showing ever disappears.
 *
 * Within a given slot, CMS content wins over the static/curated version —
 * they never render both. `service.sectionOrder` from the CMS controls the
 * final section order (falling back to `FALLBACK_SECTION_ORDER`).
 */

/** Default section order when the CMS does not provide `sectionOrder`. */
const FALLBACK_SECTION_ORDER = [
  'video',
  'estimate',
  'intro',
  'home-repair-categories',
  'prime-difference',
  'real-homes',
  'offerings',
  'process',
  'gallery',
  'craftsmanship',
  'why-choose-us',
  'quote',
  'faq',
  'silicon-valley-loves',
  'reviews',
  'contact',
  'service-areas',
] as const

/**
 * `renderSection`'s internal keys don't all match `FALLBACK_SECTION_ORDER`'s
 * names one-for-one (e.g. it returns 'sub-services' for what the order list
 * calls 'offerings'). This is the single place that reconciles the two, so
 * every CMS-resolved section still lands in its correct ordered slot.
 */
const SLOT_KEY_ALIASES: Record<string, string> = {
  'sub-services': 'offerings',
  'service-contact': 'contact',
  'service-gallery': 'gallery',
  'service-faq': 'faq',
  'estimate-cta': 'estimate',
}

/**
 * Render the service page shell: header, hero, the ordered section stack,
 * and footer. This is the component every service route renders.
 */
export function ServiceTemplate({ service }: { service: ServiceDetail }) {
  // ---- 1. Resolve layout flags and curated content ----------------------

  const sections = getServicePageSections(service.slug)
  // Every service page uses the gallery/Contact design (the default
  // `contactVariant` is 'gallery').
  const ContactSection = sections.contactVariant === 'gallery' ? GalleryContact : HomeContact

  // Content comes from Payload only — no static per-service copy.
  const process = service.process

  // ---- 2. Collect the CMS-authored content ------------------------------

  const hasCmsBlocks = Boolean(service.contentBlocks?.length)
  const hasOverviewRich = Boolean(
    service.overviewRich?.keyFeatures ||
      service.overviewRich?.benefits ||
      service.overviewRich?.process,
  )
  const cmsQuote = service.contentBlocks?.find((block) => block.blockType === 'quote')
  const cmsVideos = service.contentBlocks?.filter((block) => block.blockType === 'video') ?? []

  const contentBlocks = service.contentBlocks?.filter((block) => {
    if (
      block.blockType === 'video' ||
      block.blockType === 'process' ||
      block.blockType === 'gallery' ||
      block.blockType === 'quote'
    ) {
      return false
    }
    return true
  })

  // Non-hero CMS sections, in Payload order. The hero is excluded because
  // `ServiceHero` always renders it from the service record itself.
  const cmsContentSections = (service.sections ?? []).filter(
    (block) => block && typeof block.blockType === 'string' && block.blockType !== 'hero',
  )
  const hasCmsSections = cmsContentSections.length > 0
  const cmsBlockTypes = new Set(cmsContentSections.map((block) => String(block.blockType)))
  const cmsHas = (...types: string[]) => types.some((type) => cmsBlockTypes.has(type))

  // Resolve every CMS section up front, once, through the same dispatcher
  // used for the residual clump — so a section that resolves to a known
  // slot key (e.g. 'craftsmanship', 'gallery', 'quote') is pulled OUT of
  // the clump and placed at that slot's real position, and only sections
  // `renderSection` genuinely can't place fall through to `cms-body`.
  const cmsSlotNodes = new Map<string, ReactNode>()
  const residualCmsSections: NonNullable<ServiceDetail['sections']> = []
  const slotSingletons = new Set<string>()
  let sharedRegistryIndex = 0
  for (const rawSection of cmsContentSections) {
    const result: RenderedSection | null = renderSection(
      rawSection,
      service,
      slotSingletons,
      ContactSection,
    )
    if (!result || result.key === 'shared-registry') {
      // Either nothing resolved, or it resolved via the generic shared
      // registry with no specific ordered slot — both go in the residual
      // clump, positioned near the intro as before. Each shared-registry
      // section gets its own key so consecutive ones don't overwrite each
      // other.
      if (result) cmsSlotNodes.set(`shared-registry-${sharedRegistryIndex++}`, result.node)
      else residualCmsSections.push(rawSection)
      continue
    }
    const slotKey = SLOT_KEY_ALIASES[result.key] || result.key
    // First CMS section for a given slot wins; a page legitimately
    // repeating a section type (e.g. two 'video' blocks) is rare enough
    // that keeping only the first avoids two unrelated videos silently
    // fighting for the same slot position.
    if (!cmsSlotNodes.has(slotKey)) cmsSlotNodes.set(slotKey, result.node)
  }
  // Shared-registry results (no dedicated slot) render in encounter order,
  // right alongside whatever residual sections remain.
  const sharedRegistryNodes = [...cmsSlotNodes.entries()]
    .filter(([key]) => key.startsWith('shared-registry-'))
    .map(([, node]) => node)
  for (const key of [...cmsSlotNodes.keys()]) {
    if (key.startsWith('shared-registry-')) cmsSlotNodes.delete(key)
  }

  // Video section: only CMS 'video' blocks (Payload).
  const legacyVideoSection = cmsVideos.length ? (
    cmsVideos.map((block, index) =>
      block.blockType === 'video' ? (
        <ServiceVideoSection
          key={`video-${index}`}
          title={block.heading || ''}
          videoUrl={block.videoUrl}
          poster={block.poster}
        />
      ) : null,
    )
  ) : null
  const videoSection = cmsSlotNodes.get('video') ?? legacyVideoSection

  // ---- 3. Build one node per section slot -------------------------------

  const sectionNodes: Array<{ key: string; node: ReactNode }> = [
    {
      key: 'intro',
      // The Custom Kitchen and Shaker Kitchen pages have no overview/intro
      // section on WordPress — their content is the CMS sections, so the
      // static Key Features / Benefits overview never renders for them.
      node:
        service.slug === 'custom-kitchen-silicon-valley' ||
        service.slug === 'shaker-kitchen-silicon-valley' ? null : !sections.homeRepairCategories && hasOverviewRich ? (
          // Rich-text overview lists (Key Features / Benefits / Process) from
          // Payload take priority over both the legacy checklist blocks and
          // the built-in static arrays.
          <Section>
            <ServiceOverview
              service={service}
              showInlineProcess={sections.inlineProcess}
              hasVisualProcess={sections.visualProcess}
            />
          </Section>
        ) : !sections.homeRepairCategories && contentBlocks?.length ? (
          <Section>
            <ServiceContentBlocks service={service} blocks={contentBlocks} />
          </Section>
        ) : !sections.homeRepairCategories &&
          !hasCmsBlocks &&
          !(hasCmsSections && cmsHas('image-text', 'sub-services', 'prime-difference')) ? (
          <Section>
            <ServiceOverview
              service={service}
              showInlineProcess={sections.inlineProcess}
              hasVisualProcess={sections.visualProcess}
            />
          </Section>
        ) : null,
    },
    {
      key: 'home-repair-categories',
      // A CMS `repair-services` block (same conceptual section, migrated
      // data) takes priority over the static hardcoded categories so the
      // two don't both render.
      node:
        cmsSlotNodes.get('repair-services') ??
        (sections.homeRepairCategories ? (
          <ServiceHomeRepairCategoriesSection categories={homeRepairCategoriesContent} />
        ) : null),
    },
    {
      key: 'prime-difference',
      node: cmsSlotNodes.get('prime-difference') ?? null,
    },
    {
      // "Why Choose Prime Kitchens? / The Prime Difference" — the European
      // Kitchen page's bespoke three-card section (Payload `primeKitchens`
      // group on the service record).
      key: 'prime-kitchens',
      node: service.primeKitchens?.cards?.length ? (
        <ServicePrimeKitchensSection content={service.primeKitchens} />
      ) : null,
    },
    {
      // "Discover Your Signature Style" — icon cards + photo gallery
      // (Payload `iconChecklistGallery` group).
      key: 'icon-checklist-gallery',
      node: service.iconChecklistGallery?.items?.length ? (
        <ServiceIconChecklistGallerySection
          eyebrow={service.iconChecklistGallery.eyebrow}
          heading={service.iconChecklistGallery.heading || ''}
          items={service.iconChecklistGallery.items.map((item) => ({
            icon: item.icon || '',
            title: item.title,
            description: item.description || '',
          }))}
          images={service.iconChecklistGallery.images ?? []}
          imageAlt={service.iconChecklistGallery.heading || ''}
        />
      ) : null,
    },
    {
      // "The Power of Customization" — side image + checklist
      // (Payload `imageChecklist` group).
      key: 'image-checklist',
      node: service.imageChecklist?.items?.length ? (
        <ServiceImageChecklistSection
          eyebrow={service.imageChecklist.eyebrow}
          heading={service.imageChecklist.heading || ''}
          description={service.imageChecklist.description}
          image={service.imageChecklist.image || ''}
          imageAlt={service.imageChecklist.heading || ''}
          items={service.imageChecklist.items.map((item) => ({
            title: item.title,
            description: item.description || '',
          }))}
        />
      ) : null,
    },
    {
      // "Materials Crafted to Perfection" — four-card materials grid
      // (Payload `materialsShowcase` group).
      key: 'materials-showcase',
      node: service.materialsShowcase?.items?.length ? (
        <MaterialsShowcaseSection
          eyebrow={service.materialsShowcase.eyebrow}
          heading={service.materialsShowcase.heading || ''}
          description={service.materialsShowcase.description}
          // The WordPress description emphasizes these exact terms in bold.
          boldTerms={['premium materials', 'custom kitchen']}
          items={service.materialsShowcase.items.map((item) => ({
            image: item.image || '',
            title: item.title,
            description: item.description,
          }))}
        />
      ) : null,
    },
    {
      // Three review cards (Isabel E. / Christian F. / James G.) — the
      // Shaker Kitchen page's testimonial grid (Payload `testimonialCards`
      // group).
      key: 'testimonial-cards',
      node: service.testimonialCards?.items?.length ? (
        <ServiceTestimonialCardsSection
          items={service.testimonialCards.items.map((item) => ({
            name: item.name,
            quote: item.quote || '',
            avatar: item.avatar,
          }))}
        />
      ) : null,
    },
    {
      key: 'why-choose-us',
      node:
        service.slug === 'additions' ||
        service.slug === 'complete-renovation' ||
        service.slug === 'adu' ? (
          // Additions, Complete Renovation and ADU show the "Experience the
          // Prime Difference" design (gallery WhyChooseUs).
          <WhyChooseUs />
        ) : (
          (cmsSlotNodes.get('why-choose-us') ??
          (sections.homeRepairWhyChooseUs || sections.whyChooseUs ? (
            service.whyChooseUs?.items?.length ? (
              // Payload "Why Choose Us" group — renders only CMS content.
              <ServiceWhyChooseUsSection
                heading={service.whyChooseUs.heading}
                items={service.whyChooseUs.items.map((item) => ({
                  title: item.title,
                  description: item.description,
                }))}
              />
            ) : null
          ) : null))
        ),
    },
    {
      key: 'real-homes',
      node:
        cmsSlotNodes.get('real-homes') ??
        (sections.realHomes && service.realHomes?.testimonials?.length
          ? <ServiceRealHomesStoriesSection {...getRealHomesContent(service)!} />
          : null),
    },
    {
      key: 'video',
      node: !sections.videoFirst ? videoSection : null,
    },
    {
      key: 'offerings',
      // Offerings come from Payload sub-services blocks only.
      node: cmsSlotNodes.get('offerings') ?? null,
    },
    {
      key: 'process',
      node:
        cmsSlotNodes.get('process') ??
        (() => {
          if (!sections.process) return null
          const payloadProcess = service.process
          if (payloadProcess?.steps?.length) {
            const steps = payloadProcess.steps.map((step, index) => ({
              title: step.title || `Step ${index + 1}`,
              description: step.description || '',
              image: step.image,
            }))
            // Home Remodeling keeps the bespoke "A Client-Centered Approach"
            // design (side image + steps), now fed from Payload. Bathroom shows
            // only the steps (its header lives in the craftsmanship slot).
            if (sections.homeProcess || service.slug === 'home-remodeling') {
              return (
                <HomeRemodelingProcessSection
                  title={payloadProcess.title}
                  description={payloadProcess.description}
                  steps={steps}
                />
              )
            }
            if (service.slug === 'bathroom-remodeling') {
              return (
                <ServiceProcessSection
                  eyebrow={payloadProcess.eyebrow}
                  title={payloadProcess.title || ''}
                  description={payloadProcess.description || ''}
                  steps={steps}
                  hideHeader
                />
              )
            }
            return (
              <>
                {/* "Our Process / We make it easy for you" — craftsmanship design
                    (2 images + button + heading + text), separate from steps. */}
                <ServiceCraftsmanshipTransformsSection
                  eyebrow={payloadProcess.eyebrow || ''}
                  heading="We make it easy for"
                  headingAccent="you"
                  body={payloadProcess.description ? [payloadProcess.description] : []}
                  images={[service.image, service.image]}
                  cta={{ label: 'Free on-site estimate', href: '/contact' }}
                />
                {/* Steps — separate section, no repeated header. */}
                <ServiceProcessSection
                  eyebrow={payloadProcess.eyebrow}
                  title={payloadProcess.title || 'We make it easy for you'}
                  description={payloadProcess.description || ''}
                  steps={steps}
                  hideHeader
                />
              </>
            )
          }
          return null
        })(),
    },
    {
      key: 'gallery',
      node:
        cmsSlotNodes.get('gallery') ??
        (sections.gallery ? <ServiceGallery service={service} /> : null),
    },
    {
      key: 'craftsmanship',
      node:
        cmsSlotNodes.get('craftsmanship') ??
        (sections.craftsmanship && service.craftsmanship ? (
          <ServiceCraftsmanshipTransformsSection
            eyebrow=""
            heading=""
            headingAccent=""
            body={[]}
            images={[service.image, service.image]}
            cta={{ label: '', href: '/contact' }}
            content={service.craftsmanship}
          />
        ) : null),
    },
    {
      key: 'service-areas',
      // The comprehensive home repair and European Kitchen pages keep only
      // the city-pill strip (LandingServiceAreasSection, rendered by the
      // `areas-we-service` slot) — no "Service areas" cards section.
      node:
        service.slug === 'comprehensive-home-repair-installation-services-in-silicon-valley' ||
        service.slug === 'european-kitchen-silicon-valley' ||
        service.slug === 'custom-kitchen-silicon-valley' ||
        service.slug === 'shaker-kitchen-silicon-valley' ||
        service.slug === 'adu' ||
        service.slug === 'finance' ? null : service.slug === 'additions' ||
          service.slug === 'complete-renovation' ? (
          <LandscapingServiceAreas serviceSlug={service.slug} />
        ) : (
          (cmsSlotNodes.get('service-areas') ?? <ServiceAreasSection service={service} />)
        ),
    },
    {
      key: 'areas-we-service',
      node:
        service.slug === 'kitchen-remodeling' ||
        service.slug === 'bathroom-remodeling' ||
        service.slug === 'home-remodeling' ||
        service.slug === 'comprehensive-home-repair-installation-services-in-silicon-valley' ||
        service.slug === 'european-kitchen-silicon-valley' ||
        service.slug === 'custom-kitchen-silicon-valley' ||
        service.slug === 'shaker-kitchen-silicon-valley' ||
        service.slug === 'adu' ||
        service.slug === 'finance' ? (
          <ServiceAreasStrip serviceSlug={service.slug} heading={service.areasWeService?.heading} />
        ) : null,
    },
    {
      key: 'quote',
      node:
        cmsSlotNodes.get('quote') ??
        (service.quote?.quote ? (
          <ServiceQuoteSection
            heading={service.quote.heading || ''}
            quote={service.quote.quote}
            attribution={service.quote.attribution || ''}
            image={service.quote.image || service.image}
          />
        ) : sections.quote && cmsQuote && cmsQuote.blockType === 'quote' ? (
          <ServiceQuoteSection
            heading="Our promise"
            quote={cmsQuote.quote}
            attribution={cmsQuote.attribution || 'Prime Design & Build'}
            image={service.image}
          />
        ) : null),
    },
    {
      key: 'faq',
      node:
        cmsSlotNodes.get('faq') ?? (sections.faq ? <ServiceFaqLoader slug={service.slug} /> : null),
    },
    {
      key: 'estimate',
      node: cmsSlotNodes.get('estimate') ?? (sections.estimate ? <ServiceEstimateCta /> : null),
    },
    {
      key: 'client-approach',
      node:
        service.slug === 'complete-renovation' && service.clientApproach ? (
          <ServiceClientApproachSection
            content={service.clientApproach}
            image={service.clientApproachImage}
          />
        ) : null,
    },
    {
      key: 'silicon-valley-loves',
      node:
        cmsSlotNodes.get('silicon-valley-loves') ??
        (sections.siliconValleyLoves &&
        (service.siliconValleyLoves?.heading || service.siliconValleyLoves?.body) ? (
          <ServiceSiliconValleyLovesSection content={service.siliconValleyLoves} />
        ) : null),
    },
    {
      key: 'reviews',
      node: cmsSlotNodes.get('reviews') ?? (sections.reviews ? <ReviewsSection /> : null),
    },
    {
      key: 'contact',
      node: cmsSlotNodes.get('contact') ?? (sections.contact ? <ContactSection /> : null),
    },
    {
      // Only truly-unresolvable CMS sections land here now, plus anything
      // that matched the shared registry with no dedicated slot.
      key: 'cms-body',
      node:
        residualCmsSections.length || sharedRegistryNodes.length ? (
          <>
            {sharedRegistryNodes}
            {residualCmsSections.length ? (
              <ServiceSectionRenderer
                sections={residualCmsSections}
                service={service}
                ContactComponent={ContactSection}
              />
            ) : null}
          </>
        ) : null,
    },
  ]

  // ---- 4. Order the sections and render ----------------------------------

  // Per-page order overrides — the sequence shown on the original WordPress
  // page when it differs from the shared default.
  const PAGE_SECTION_ORDERS: Record<string, string[]> = {
    // Additions (WP page 1978): "Home Additions" image-text → Real Homes →
    // video → free estimate → Silicon Valley Loves → Prime Difference →
    // reviews → contact → areas.
    additions: [
      'intro',
      'real-homes',
      'video',
      'estimate',
      'silicon-valley-loves',
      'why-choose-us',
      'reviews',
      'contact',
      'service-areas',
    ],
    // Complete Renovation mirrors Additions' section sequence (no standalone
    // video section — the WordPress page does not have one). Its process
    // section ("A Client-Centered Approach to Home Remodeling") sits directly
    // below the estimate CTA.
    'complete-renovation': [
      'intro',
      'estimate',
      'client-approach',
      'craftsmanship',
      'silicon-valley-loves',
      'why-choose-us',
      'reviews',
      'contact',
      'service-areas',
    ],
    // Kitchen Remodeling (WP page 327): estimate → video → offerings →
    // process → Silicon Valley Loves → service areas → quote → FAQ → gallery
    // → reviews → contact → areas-we-service (the shared "Areas we service"
    // strip, same as the previous page).
    'kitchen-remodeling': [
      'estimate',
      'video',
      'offerings',
      'process',
      'silicon-valley-loves',
      'service-areas',
      'quote',
      'faq',
      'gallery',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Bathroom Remodeling (WP page 337): estimate → process → offerings →
    // gallery → craftsmanship ("Let's build your dream bathroom") →
    // Silicon Valley Loves → Prime Difference → FAQ → service areas →
    // reviews → contact → areas-we-service.
    'bathroom-remodeling': [
      'estimate',
      'process',
      'offerings',
      'gallery',
      'silicon-valley-loves',
      'prime-difference',
      'faq',
      'service-areas',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Home Remodeling (WP page 335).
    'home-remodeling': [
      'real-homes',
      'video',
      'estimate',
      'process',
      'gallery',
      'craftsmanship',
      'service-areas',
      'silicon-valley-loves',
      'prime-difference',
      'faq',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Home Repair & Installation.
    'comprehensive-home-repair-installation-services-in-silicon-valley': [
      'home-repair-categories',
      'why-choose-us',
      'areas-we-service',
    ],
    // European Kitchen (WP page european-kitchen-silicon-valley): estimate →
    // video (moved out of the hero) → "Why Choose Prime Kitchens? / The Prime
    // Difference" → feature cards (with the section header) → reviews →
    // contact → the shared "Areas we service" strip.
    'european-kitchen-silicon-valley': [
      'estimate',
      'video',
      'prime-kitchens',
      'home-repair-categories',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Custom Kitchen (WP page custom-kitchen-silicon-valley): estimate →
    // video (moved out of the hero) → icon checklist gallery → image
    // checklist → materials showcase → "Why Choose Prime Kitchens? / The
    // Prime Difference" → reviews → contact → the shared "Areas we service"
    // strip.
    'custom-kitchen-silicon-valley': [
      'estimate',
      'video',
      'icon-checklist-gallery',
      'image-checklist',
      'materials-showcase',
      'prime-kitchens',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Shaker Kitchen (WP page shaker-kitchen-silicon-valley): estimate →
    // video (moved out of the hero) → feature cards (with the section
    // header) → Prime Difference → testimonial cards → contact → the shared
    // "Areas we service" strip.
    'shaker-kitchen-silicon-valley': [
      'estimate',
      'video',
      'home-repair-categories',
      'prime-difference',
      'testimonial-cards',
      'contact',
      'areas-we-service',
    ],
    // ADU (WP page adu): intro → estimate → craftsmanship → why choose →
    // reviews → contact → the shared "Areas we service" strip.
    adu: [
      'intro',
      'estimate',
      'craftsmanship',
      'why-choose-us',
      'reviews',
      'contact',
      'areas-we-service',
    ],
    // Finance (WP page `finance`): hero → "One-Stop Hub" image-text → "Let's
    // work together" craftsmanship → "Renovation financing, simplified"
    // process → "Pick a company you can trust" (Licensed/Bonded/Insured) →
    // FAQ → the shared areas strip. The first four are CMS sections that
    // render through the residual clump (`cms-body`) in block order.
    finance: ['cms-body', 'faq', 'areas-we-service'],
  }

  const order: string[] = service.sectionOrder?.length
    ? service.sectionOrder
    : PAGE_SECTION_ORDERS[service.slug]
      ? PAGE_SECTION_ORDERS[service.slug]
      : [...FALLBACK_SECTION_ORDER]

  const rank = (key: string) => {
    const index = order.indexOf(key)
    if (index >= 0) return index
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

/** Backward-compatible alias for the pre-refactor export name. */
export const ServiceDetailPage = ServiceTemplate

// Re-exported for compatibility with older imports that pulled these from
// this file (each now lives in its own module).
export { ServiceContentBlocks } from './ServiceContentBlocks'
export { ServiceSectionRenderer } from './ServiceSectionRenderer'
