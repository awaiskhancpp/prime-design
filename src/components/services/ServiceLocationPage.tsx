import { HomeContact } from '@/components/blocks/HomeContact'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Section } from '@/components/ui/Section'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getServiceVideo, ServiceVideoSection } from './ServiceVideoSection'
import { ServiceLocationHero } from './ServiceLocationHero'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { getServiceLocationDetail, type ServiceLocation } from '@/lib/serviceLocations'

export function ServiceLocationPage({
  entry,
}: {
  entry: ServiceLocation & { service: Parameters<typeof getServiceLocationDetail>[0] }
}) {
  const service = getServiceLocationDetail(entry.service, entry.location.name)
  const video = getServiceVideo(entry.serviceSlug)
  const offerings = getServiceOfferings(entry.serviceSlug)
  const quote = getServiceQuote(entry.serviceSlug)

  return (
    <div className="min-h-screen bg-white">
      <ServiceLocationHero service={service} />
      <main>
        {video ? (
          <Section>
            <ServiceVideoSection {...video} embedded />
          </Section>
        ) : null}
        {offerings ? <ServiceOfferingsSection {...offerings} /> : null}
        {quote ? <ServiceQuoteSection {...quote} /> : null}
        <ProjectsReviews />
        <WhyChooseUs />
        <ServiceSiliconValleyLovesSection />
        <HomeContact />
      </main>
      <SiteFooter />
    </div>
  )
}
