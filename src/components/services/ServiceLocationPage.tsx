import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
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
import { Contact } from '../gallery/Contact'
import { ServiceLocationFooter } from './ServiceLocationFooter'

export function ServiceLocationPage({
  entry,
}: {
  entry: ServiceLocation & { service: ServiceDetail }
}) {
  const service = entry.service
  const overrides = new Map(
    (entry.sectionOverrides ?? []).map((override) => [override.sectionKey, override]),
  )
  const enabled = (key: string) => overrides.get(key)?.enabled !== false
  const video = getLocationVideoContent(entry.serviceSlug, entry.location)
  const offerings = getServiceOfferings(entry.serviceSlug)
  const quote = getServiceQuote(entry.serviceSlug)

  return (
    <div className="min-h-screen bg-white">
      <ServiceLocationHeroForm service={service} location={entry.location} />
      <main>
        {enabled('video') && video ? (
          <Section>
            <ServiceVideoSection {...video} embedded />
          </Section>
        ) : null}
        {enabled('intro') ? (
          <ServiceDontSettleSection
            {...getDontSettleContent(service, entry.location)}
            {...(overrides.get('intro')?.heading
              ? { heading: overrides.get('intro')?.heading }
              : {})}
            {...(overrides.get('intro')?.body ? { body: overrides.get('intro')?.body } : {})}
            {...(overrides.get('intro')?.image ? { image: overrides.get('intro')?.image } : {})}
          />
        ) : null}
        {enabled('offerings') && offerings ? <ServiceOfferingsSection {...offerings} /> : null}
        {enabled('quote') && quote ? <ServiceQuoteSection {...quote} /> : null}
        {enabled('reviews') ? <ProjectsReviews /> : null}
        {enabled('prime-difference') ? (
          <ServicePrimeDifferenceSection {...getPrimeDifferenceContent(service)} />
        ) : null}
        {enabled('silicon-valley-loves') ? <ServiceSiliconValleyLovesSection /> : null}
        {enabled('contact') ? <Contact /> : null}
        <ServiceLocationFooter />
      </main>
    </div>
  )
}
