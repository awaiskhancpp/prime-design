import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { Section } from '@/components/ui/Section'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getLocationVideoContent, ServiceVideoSection } from './ServiceVideoSection'
import { ServiceLocationHeroForm } from './ServiceLocationHeroForm'
import { getDontSettleContent, ServiceDontSettleSection } from './sections/ServiceDontSettleSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import type { ServiceLocation } from '@/lib/serviceLocations'
import type { ServiceDetail } from '@/lib/services'
import {
  getPrimeDifferenceContent,
  ServicePrimeDifferenceSection,
} from './sections/ServicePrimeDifferenceSection'

export function ServiceLocationPage({
  entry,
}: {
  entry: ServiceLocation & { service: ServiceDetail }
}) {
  const service = entry.service
  const video = getLocationVideoContent(entry.serviceSlug, entry.location)
  const offerings = getServiceOfferings(entry.serviceSlug)
  const quote = getServiceQuote(entry.serviceSlug)

  return (
    <div className="min-h-screen bg-white">
      <ServiceLocationHeroForm service={service} location={entry.location} />
      <main>
        {video ? (
          <Section>
            <ServiceVideoSection {...video} embedded />
          </Section>
        ) : null}
        <ServiceDontSettleSection {...getDontSettleContent(service, entry.location)} />
        {offerings ? <ServiceOfferingsSection {...offerings} /> : null}
        {quote ? <ServiceQuoteSection {...quote} /> : null}
        <ProjectsReviews />
        <ServicePrimeDifferenceSection {...getPrimeDifferenceContent(service)} />
        <ServiceSiliconValleyLovesSection />
      </main>
    </div>
  )
}
