import Image from 'next/image'
import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import type { ServiceContentBlock, ServiceDetail } from '@/lib/services'
import {
  getServiceOfferings,
  ServiceOfferingsSection,
} from './ServiceOfferingsSection'
import { getServiceProcess, ServiceProcessSection } from './ServiceProcessSection'
import { getServiceVideo, ServiceVideoSection } from './ServiceVideoSection'
import { ServiceAreasSection } from './ServiceAreasSection'
import { ServiceEstimateCta } from './ServiceEstimateCta'
import { ServiceFaq } from './ServiceFaq'
import { ServiceGallery } from './ServiceGallery'
import { ServiceHero } from './ServiceHero'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'

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
  const offerings = getServiceOfferings(service.slug)
  const fallbackVideo = getServiceVideo(service.slug)
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
          {contentBlocks?.length ? (
            <ServiceContentBlocks blocks={contentBlocks} />
          ) : (
            <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
              <div>
                <h2 className="font-display text-3xl font-semibold text-ink">
                  {service.introHeading || `${service.title} — expanding your living space`}
                </h2>
                <div className="mt-3 h-px w-20 bg-brass" />
              </div>
              <div className="grid gap-9">
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">Key Features:</h3>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-2/75">
                    {service.keyFeatures.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="text-brass">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-ink">
                    Benefits of {service.title}:
                  </h3>
                  <ul className="mt-4 grid gap-3 text-sm leading-6 text-ink-2/75">
                    {service.benefits.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className="text-brass">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </Section>
        {cmsVideos.length
          ? cmsVideos.map((block, index) =>
              block.blockType === 'video' ? (
                <ServiceVideoSection
                  key={`video-${index}`}
                  title={block.heading || 'See the difference'}
                  videoUrl={block.videoUrl}
                  poster={block.poster}
                />
              ) : null,
            )
          : fallbackVideo
            ? <ServiceVideoSection {...fallbackVideo} />
            : null}
        {offerings ? <ServiceOfferingsSection {...offerings} /> : null}
        {process ? <ServiceProcessSection {...process} /> : null}
        <ServiceGallery service={service} />
        <ServiceAreasSection service={service} />
        {cmsQuote && cmsQuote.blockType === 'quote' ? (
          <ServiceQuoteSection
            heading="Our promise"
            quote={cmsQuote.quote}
            attribution={cmsQuote.attribution || 'Prime Design & Build'}
            image={service.image}
          />
        ) : fallbackQuote ? (
          <ServiceQuoteSection {...fallbackQuote} />
        ) : null}
        <ServiceFaq slug={service.slug} />
        <ServiceEstimateCta />
        <ProjectsReviews />
        <HomeContact />
      </main>
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
