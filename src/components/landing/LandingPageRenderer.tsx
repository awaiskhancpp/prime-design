import Link from 'next/link'

import { LandingContact as ContactForm } from './Contact'
import { HomeServices } from '@/components/blocks/HomeServices'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { ServiceEstimateCta } from '@/components/services/ServiceEstimateCta'
import { ServiceVideoSection } from '@/components/services/ServiceVideoSection'
import { ServiceContentBlocks } from '@/components/services/ServiceDetailPage'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { AppointmentScheduler } from '@/components/contact/AppointmentModal'
import { LandingFaqSection } from './LandingFaqSection'
import { LandingGallerySection } from './LandingGallerySection'
import { LandingGalleryTabs } from './LandingGalleryTabs'
import { LandingPrimeDifferenceSection } from './LandingPrimeDifferenceSection'
import { LandingProjectsSection } from './LandingProjectsSection'
import { LandingLuxuryCta } from './LandingLuxuryCta'
import { LandingFindUs } from './LandingFindUs'
import { resolveConsultations } from '@/lib/consultations'
import { galleryCategories } from '@/lib/gallery'
import type { ServiceDetail, ServiceContentBlock } from '@/lib/services'
import type { LandingPage, LandingPageTabs } from '@/lib/landingPages'

const fallbackService = (page: LandingPage): ServiceDetail => ({
  title: page.title,
  slug: page.slug,
  description: page.hero?.lead || '',
  image: page.hero?.image || '/services/home-remodeling.jpeg',
  eyebrow: page.hero?.eyebrow || '',
  lead: page.hero?.lead || '',
  keyFeatures: [],
  benefits: [],
  process: [],
  gallery: [],
})

function tabBlocks(tabs: LandingPageTabs): ServiceContentBlock[] {
  const blocks: ServiceContentBlock[] = []
  if (tabs.intro?.enabled !== false && tabs.intro?.heading)
    blocks.push({
      blockType: 'intro',
      heading: tabs.intro.heading,
      body: tabs.intro.body || '',
      eyebrow: tabs.intro.eyebrow,
      image: tabs.intro.image,
    })
  if (
    tabs.subServices?.enabled !== false &&
    tabs.subServices?.heading &&
    tabs.subServices.items?.length
  )
    blocks.push({
      blockType: 'sub-services',
      heading: tabs.subServices.heading,
      items: tabs.subServices.items.map((item) => ({
        title: item.title,
        description: item.description || '',
        image: item.image,
        link: item.link,
      })),
    })
  if (tabs.projectGallery?.enabled !== false && tabs.projectGallery?.images?.length)
    blocks.push({
      blockType: 'gallery',
      heading: tabs.projectGallery.heading,
      images: tabs.projectGallery.images,
    })
  if (tabs.reflectionGallery?.enabled && tabs.reflectionGallery.images?.length)
    blocks.push({
      blockType: 'gallery',
      heading: tabs.reflectionGallery.heading,
      images: tabs.reflectionGallery.images,
    })
  return blocks
}

export async function LandingPageRenderer({ page }: { page: LandingPage }) {
  const tabs = page.tabs || {}
  const blocks = tabBlocks(tabs)
  const legacyBlocks = blocks.length ? blocks : page.sections
  const ordered = page.sectionOrder?.length
    ? page.sectionOrder
    : [
        'estimate',
        'intro',
        'subServices',
        'primeDifference',
        'services',
        'projects',
        'projectGallery',
        'reflectionGallery',
        'whyChoose',
        'serviceAreas',
        'faq',
        'testimonials',
        'luxuryCta',
        'booking',
        'findUs',
        'contactForm',
      ]
  const service = fallbackService(page)
  const allConsultations = tabs.booking?.enabled ? await resolveConsultations() : []
  // A service-specific landing page (kitchen-remodeling-information,
  // bathroom-remodeling-information, etc.) should only offer booking for
  // that one service — showing all consultation types on a Kitchen page
  // means two-thirds of the cards are for services the visitor didn't
  // come here for. Generic pages with no single matching service (like
  // remodeling-information) keep the full picker as a fallback.
  const consultationKeywordMap: Array<{ keyword: string; slug: string }> = [
    { keyword: 'kitchen', slug: 'kitchen-remodeling' },
    { keyword: 'bathroom', slug: 'bathroom-remodeling' },
    { keyword: 'addition', slug: 'additions' },
    { keyword: 'adu', slug: 'adu' },
    { keyword: 'complete-renovation', slug: 'complete-renovation' },
  ]
  const matchedConsultationSlug = consultationKeywordMap.find((entry) =>
    page.slug.includes(entry.keyword),
  )?.slug
  const matchedConsultations = matchedConsultationSlug
    ? allConsultations.filter((item) => item.slug === matchedConsultationSlug)
    : []
  const consultations = matchedConsultations.length ? matchedConsultations : allConsultations

  // Build the list of galleries that actually have content, instead of an
  // all-or-nothing check for exactly two. A kitchen/bathroom-specific page
  // typically has one of these two configured; a generic page (like
  // remodeling-information) has neither, and previously fell through to a
  // single flat grid with no tabs at all. Falling back to the same
  // category set the real /gallery page uses keeps generic pages from
  // losing the tabbed browsing experience entirely.
  const configuredGalleries = [
    tabs.projectGallery?.enabled !== false && tabs.projectGallery?.images?.length
      ? { label: tabs.projectGallery.heading || 'Our Kitchens', images: tabs.projectGallery.images }
      : null,
    tabs.reflectionGallery?.enabled && tabs.reflectionGallery?.images?.length
      ? {
          label: tabs.reflectionGallery.heading || 'Our Bathrooms',
          images: tabs.reflectionGallery.images,
        }
      : null,
  ].filter((entry): entry is { label: string; images: string[] } => entry !== null)

  const genericCategoryTabs = galleryCategories.map((category) => ({
    label: category.title,
    images: category.images,
  }))

  const renderSection = (name: string) => {
    if (name === 'estimate' && tabs.estimate && tabs.estimate.enabled !== false)
      return <ServiceEstimateCta key={name} />
    if (name === 'intro' || name === 'subServices')
      return blocks.length ? (
        <Section key={name}>
          <ServiceContentBlocks
            service={service}
            blocks={blocks.filter(
              (block) =>
                (name === 'intro' && block.blockType === 'intro') ||
                (name === 'subServices' && block.blockType === 'sub-services'),
            )}
          />
        </Section>
      ) : null
    if (name === 'primeDifference')
      return tabs.primeDifference?.enabled !== false && tabs.primeDifference ? (
        <LandingPrimeDifferenceSection
          key={name}
          heading={tabs.primeDifference.heading}
          headingAccent={tabs.primeDifference.headingAccent}
          body={tabs.primeDifference.body}
          checklist={tabs.primeDifference.checklist}
          videos={tabs.video?.videos}
        />
      ) : null
    if (name === 'video' && tabs.video?.enabled && tabs.video.videoUrl)
      return (
        <ServiceVideoSection
          key={name}
          eyebrow={tabs.video.eyebrow}
          title={tabs.video.heading || page.title}
          description={tabs.video.description}
          videoUrl={tabs.video.videoUrl}
          poster={tabs.video.poster}
        />
      )
    if (name === 'projectGallery') {
      if (configuredGalleries.length >= 2)
        return (
          <LandingGalleryTabs
            key={name}
            heading={page.hero?.heading || page.title}
            description={page.hero?.lead}
            tabs={configuredGalleries}
          />
        )
      if (configuredGalleries.length === 1)
        return (
          <LandingGallerySection
            key={name}
            heading={configuredGalleries[0].label}
            images={configuredGalleries[0].images}
          />
        )
      // Neither gallery is configured for this page (typical of a generic,
      // non-room-specific landing page) — fall back to the same tabbed
      // categories the real /gallery page uses, rather than showing nothing.
      return (
        <LandingGalleryTabs
          key={name}
          heading={page.hero?.heading || page.title}
          description={page.hero?.lead}
          tabs={genericCategoryTabs}
        />
      )
    }
    if (name === 'reflectionGallery') {
      // Folded into the projectGallery branch above once there's more than
      // one gallery configured — never render it as a second, separate
      // section in that case.
      if (configuredGalleries.length >= 2) return null
      if (!tabs.reflectionGallery?.enabled || !tabs.reflectionGallery?.images?.length) return null
      return (
        <LandingGallerySection
          key={name}
          heading={tabs.reflectionGallery.heading}
          images={tabs.reflectionGallery.images}
        />
      )
    }
    if (name === 'projects' && tabs.projects?.enabled !== false && tabs.projects)
      return (
        <LandingProjectsSection
          key={name}
          eyebrow={tabs.projects.eyebrow}
          heading={tabs.projects.heading}
          description={tabs.projects.description}
          items={tabs.projects.items || []}
        />
      )
    if (name === 'whyChoose' && tabs.whyChoose?.enabled !== false && tabs.whyChoose)
      return <WhyChooseUs key={name} />
    if (name === 'services' && tabs.services?.enabled !== false) return <HomeServices key={name} />
    if (name === 'serviceAreas' && tabs.serviceAreas?.enabled !== false && tabs.serviceAreas)
      return <LandscapingServiceAreas key={name} />
    if (
      name === 'faq' &&
      tabs.faq?.enabled !== false &&
      (tabs.faq?.items?.length || tabs.faq?.categories?.length)
    )
      return (
        <LandingFaqSection
          key={name}
          heading={tabs.faq.heading}
          items={tabs.faq.items}
          categories={tabs.faq.categories}
        />
      )
    if (name === 'testimonials' && tabs.testimonials?.enabled !== false && tabs.testimonials)
      return <ProjectsReviews key={name} />
    if (name === 'booking' && tabs.booking?.enabled && consultations.length)
      return (
        <Section key={name}>
          <div className="flex justify-center">
            <AppointmentScheduler consultation={consultations[0].title} />
          </div>
        </Section>
      )
    if (name === 'luxuryCta' && tabs.luxuryCta?.enabled !== false && tabs.luxuryCta)
      return (
        <LandingLuxuryCta
          key={name}
          eyebrow={tabs.luxuryCta.eyebrow}
          heading={tabs.luxuryCta.heading}
          body={tabs.luxuryCta.body}
          link={tabs.luxuryCta.link}
        />
      )
    if (name === 'findUs' && tabs.findUs?.enabled !== false && tabs.findUs)
      return (
        <LandingFindUs
          key={name}
          heading={tabs.findUs.heading}
          phone={tabs.findUs.phone}
          email={tabs.findUs.email}
          address={tabs.findUs.address}
        />
      )
    if (name === 'contactForm' && tabs.contactForm?.enabled !== false && tabs.contactForm)
      return <ContactForm key={name} />
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        showHeader={false}
        eyebrow={page.hero?.eyebrow || 'Prime Design & Build'}
        title={page.hero?.heading || page.title}
        description={page.hero?.lead}
        image={page.hero?.image || '/services/home-remodeling.jpeg'}
        imageAlt={page.title}
      />
      <main>
        {legacyBlocks.length && !Object.keys(tabs).length ? (
          <Section>
            <ServiceContentBlocks service={service} blocks={legacyBlocks} />
          </Section>
        ) : (
          ordered.map(renderSection)
        )}
        {!tabs.contactForm && page.cta?.showForm !== false ? <ContactForm /> : null}
        {!tabs.contactForm && page.cta?.showForm === false && page.cta?.link ? (
          <Section className="bg-paper-2 text-center">
            <Link
              href={page.cta.link}
              className="inline-flex bg-brass px-6 py-3 text-sm font-semibold text-white"
            >
              {page.cta.text || 'Get Your Free Estimate'}
            </Link>
          </Section>
        ) : null}
      </main>
    </div>
  )
}
