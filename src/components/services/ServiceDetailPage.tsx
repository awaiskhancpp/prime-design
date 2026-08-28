import Image from 'next/image'
import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import type { ServiceContentBlock, ServiceDetail } from '@/lib/services'
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getServiceProcess, ServiceProcessSection } from './ServiceProcessSection'
import { getServiceVideo, ServiceVideoSection } from './ServiceVideoSection'
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
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'

function splitLabeledLine(line: string) {
  const separator = line.indexOf(':')
  if (separator <= 0) return { title: line, description: '' }
  return { title: line.slice(0, separator).trim(), description: line.slice(separator + 1).trim() }
}

type ServicePageSections = {
  video: boolean
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
}

const defaultServicePageSections: ServicePageSections = {
  video: false,
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
  },
  'complete-renovation': {
    ...defaultServicePageSections,
    process: true,
    inlineProcess: true,
    craftsmanship: true,
    estimate: true,
    reviews: true,
    contact: true,
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
  },
  'home-repair-installation-services': {
    ...defaultServicePageSections,
    homeRepairCategories: true,
    homeRepairWhyChooseUs: true,
  },
  'european-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
  },
  'shaker-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    whyChooseUs: true,
    estimate: true,
    reviews: true,
    contact: true,
  },
  'custom-kitchen-silicon-valley': {
    ...defaultServicePageSections,
    reviews: true,
  },
}

function getServicePageSections(slug: string) {
  return servicePageSections[slug] || defaultServicePageSections
}

function ServiceOverview({
  service,
  showInlineProcess,
}: {
  service: ServiceDetail
  showInlineProcess: boolean
}) {
  const sideImages = [...new Set([service.image, ...service.gallery].filter(Boolean))].slice(0, 2)
  const hasVisualProcess = Boolean(
    service.slug === 'kitchen-remodeling' || service.slug === 'bathroom-remodeling',
  )

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-16">
      <div>
        <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
          {service.introHeading || `${service.title} — expanding your living space`}
        </h2>
        <div className="mt-3 h-px w-20 bg-brass" />

        <div className="mt-10 grid gap-10">
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
                Our {service.slug === 'additions' ? 'home addition' : service.title.toLowerCase()}{' '}
                process is designed to be seamless and efficient. Here’s an overview of how we work:
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

      <div className="grid gap-5">
        {sideImages.map((image, index) => (
          <div
            key={`${image}-${index}`}
            className="relative aspect-[4/3] overflow-hidden bg-paper-2"
          >
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
  )
}

function ServiceContentBlocks({ blocks }: { blocks: NonNullable<ServiceDetail['contentBlocks']> }) {
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
        if (block.blockType === 'gallery') return null
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
        if (block.blockType === 'quote') return null
      })}
    </div>
  )
}

export function ServiceDetailPage({ service }: { service: ServiceDetail }) {
  const sections = getServicePageSections(service.slug)
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

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <main>
        <ServiceHero service={service} />
        <Section>
          {sections.homeRepairCategories ? (
            <ServiceHomeRepairCategoriesSection categories={homeRepairCategoriesContent} />
          ) : contentBlocks?.length ? (
            <ServiceContentBlocks blocks={contentBlocks} />
          ) : (
            <ServiceOverview service={service} showInlineProcess={sections.inlineProcess} />
          )}
        </Section>
        {sections.homeRepairWhyChooseUs ? <ServiceWhyChooseUsSection /> : null}
        {sections.realHomes ? (
          <ServiceRealHomesStoriesSection {...getRealHomesContent(service)} />
        ) : null}
        {cmsVideos.length ? (
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
        ) : null}
        {sections.offerings && offerings ? <ServiceOfferingsSection {...offerings} /> : null}
        {sections.process && process ? <ServiceProcessSection {...process} /> : null}
        {sections.gallery ? <ServiceGallery service={service} /> : null}
        {sections.craftsmanship ? (
          <ServiceCraftsmanshipTransformsSection {...getCraftsmanshipContent(service)} />
        ) : null}
        <ServiceAreasSection service={service} />
        {sections.quote && cmsQuote && cmsQuote.blockType === 'quote' ? (
          <ServiceQuoteSection
            heading="Our promise"
            quote={cmsQuote.quote}
            attribution={cmsQuote.attribution || 'Prime Design & Build'}
            image={service.image}
          />
        ) : sections.quote && fallbackQuote ? (
          <ServiceQuoteSection {...fallbackQuote} />
        ) : null}
        {sections.whyChooseUs ? <WhyChooseUs /> : null}
        {sections.faq ? <ServiceFaq slug={service.slug} /> : null}
        {sections.estimate ? <ServiceEstimateCta /> : null}
        {sections.siliconValleyLoves ? <ServiceSiliconValleyLovesSection /> : null}
        {sections.reviews ? <ProjectsReviews /> : null}
        {sections.contact ? <HomeContact /> : null}
      </main>
      <LandscapingServiceAreas serviceSlug={service.slug} />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
