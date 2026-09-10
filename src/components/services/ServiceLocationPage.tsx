import { ReviewsSection } from './ReviewsSection'
import { Section } from '@/components/ui/Section'
import { getServiceQuote, ServiceQuoteSection } from './ServiceQuoteSection'
import { getServiceOfferings, ServiceOfferingsSection } from './ServiceOfferingsSection'
import { getLocationVideoContent, ServiceVideoSection } from './ServiceVideoSection'
import { ServiceLocationHeroForm } from './ServiceLocationHeroForm'
import { getDontSettleContent, ServiceDontSettleSection } from './sections/ServiceDontSettleSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { ServiceTestimonialCardsSection } from './sections/ServiceTestimonialCardsSection'
import type { ServiceLocation } from '@/lib/serviceLocations'
import type { ServiceDetail } from '@/lib/services'
import {
  getPrimeDifferenceContent,
  ServicePrimeDifferenceSection,
} from './sections/ServicePrimeDifferenceSection'
import { Contact as GalleryContact } from '../gallery/Contact'
import { ServiceLocationFooter } from './ServiceLocationFooter'

/** Service name for templates, e.g. "Kitchen Remodeling". */
const serviceTitleOf = (slug: string) =>
  slug
    .split('-')
    .map((part) => (part ? part[0].toUpperCase() + part.slice(1) : part))
    .join(' ')

/** Substitute the {City} / {ServiceTitle} placeholders used in Payload copy. */
const fill = (text: string | undefined, serviceTitle: string, city: string) =>
  text ? text.replaceAll('{ServiceTitle}', serviceTitle).replaceAll('{City}', city) : text

/**
 * Service location page (city pages). Every location page renders the same
 * sections in a fixed order:
 *
 *   1. ServiceLocationHeroForm
 *   2. ServiceVideoSection
 *   3. ServiceDontSettleSection
 *   4. ServiceOfferingsSection — only categories that have sub-category
 *      pages (Kitchen Remodeling, Bathroom Remodeling)
 *   5. ServiceQuoteSection
 *   6. ProjectsReviews (ReviewsSection)
 *   7. ServicePrimeDifferenceSection
 *   8. ServiceTestimonialCardsSection
 *   9. ServiceSiliconValleyLovesSection
 *  10. gallery Contact
 *
 * plus ServiceLocationFooter at the bottom. Each city's section content is
 * authored on its service-locations record in the Payload "Location Page
 * Sections" tab (pre-filled from the WordPress source). Empty fields fall
 * back entry → parent-service section (Quote, Silicon Valley Loves,
 * Testimonial Cards — shared with the service pages) → built-in template.
 */
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
  const serviceTitle = serviceTitleOf(entry.serviceSlug)
  const city = entry.location.name

  // Video — service-location tab content (pre-filled from the WordPress
  // source), else the built-in per-city template.
  const locVideo = entry.locationVideo
  const video = locVideo?.videoUrl
    ? {
        eyebrow: fill(locVideo.eyebrow, serviceTitle, city),
        title: fill(locVideo.title, serviceTitle, city) || serviceTitle,
        description: fill(locVideo.description, serviceTitle, city),
        tagline: fill(locVideo.tagline, serviceTitle, city),
        videoUrl: locVideo.videoUrl,
        poster: locVideo.poster,
      }
    : getLocationVideoContent(entry.serviceSlug, entry.location)

  // "Don't Settle" — service-location tab content, else the template.
  const locDontSettle = entry.dontSettle
  const dontSettle = locDontSettle?.body
    ? {
        eyebrow:
          fill(locDontSettle.eyebrow, serviceTitle, city) || `${service.title} in ${city}`,
        heading: locDontSettle.heading || "Don't Settle for a Mediocre",
        headingAccent: fill(locDontSettle.headingAccent, serviceTitle, city) || city,
        body: fill(locDontSettle.body, serviceTitle, city) || '',
        image: overrides.get('intro')?.image ?? service.image,
        cta: {
          label: locDontSettle.ctaLabel || 'Talk to an expert',
          href: '#contact',
        },
      }
    : {
        ...getDontSettleContent(service, entry.location),
        ...(overrides.get('intro')?.heading ? { heading: overrides.get('intro')?.heading } : {}),
        ...(overrides.get('intro')?.body ? { body: overrides.get('intro')?.body } : {}),
        ...(overrides.get('intro')?.image ? { image: overrides.get('intro')?.image } : {}),
      }

  // Offerings — only categories with sub-category pages.
  const offerings = getServiceOfferings(entry.serviceSlug)

  // Quote — service-location override → service defaults → per-service template.
  const locQuote = entry.quote
  const svcQuote = service.quote
  const quotePayload = {
    heading: locQuote?.heading ?? svcQuote?.heading,
    quote: locQuote?.quote ?? svcQuote?.quote,
    attribution: locQuote?.attribution ?? svcQuote?.attribution,
    image: locQuote?.image ?? svcQuote?.image,
  }
  const quote = quotePayload.quote ? quotePayload : getServiceQuote(entry.serviceSlug)

  // Prime Difference — service-location tab content (pre-filled from the
  // WordPress source), else the built-in per-service content (both include
  // the review logos).
  const locPrime = entry.primeDifference
  const primePayload = {
    eyebrow: locPrime?.eyebrow,
    heading: locPrime?.heading,
    body: locPrime?.body,
    checklist: locPrime?.checklist,
    reasons: locPrime?.reasons,
  }
  const primeHeading =
    primePayload.heading === 'The Prime Difference'
      ? { heading: 'The', headingAccent: 'Prime Difference' }
      : { heading: primePayload.heading || 'The', headingAccent: undefined }
  const prime = primePayload.reasons?.length
    ? {
        eyebrow: primePayload.eyebrow,
        heading: primeHeading.heading,
        headingAccent: primeHeading.headingAccent,
        body: primePayload.body,
        checklist: primePayload.checklist,
        reasons: primePayload.reasons,
        socials: undefined,
      }
    : getPrimeDifferenceContent(service)

  // Testimonial cards — service-location override → service defaults.
  const testimonialItems = entry.testimonialCards?.items?.length
    ? entry.testimonialCards.items
    : service.testimonialCards?.items

  // Silicon Valley Loves — service-location override → service defaults;
  // the section has its own built-in copy/stats as the final template layer.
  const locLoves = entry.siliconValleyLoves
  const svcLoves = service.siliconValleyLoves
  const siliconValleyLoves = {
    eyebrow: locLoves?.eyebrow ?? svcLoves?.eyebrow,
    heading: locLoves?.heading ?? svcLoves?.heading,
    body: locLoves?.body ?? svcLoves?.body,
    image: locLoves?.image ?? svcLoves?.image,
    stats: locLoves?.stats?.length ? locLoves.stats : svcLoves?.stats,
  }

  return (
    <div className="min-h-screen bg-white">
      <ServiceLocationHeroForm service={service} location={entry.location} />
      <main>
        {enabled('video') && video ? (
          <Section>
            <ServiceVideoSection {...video} embedded />
          </Section>
        ) : null}

        {enabled('intro') ? <ServiceDontSettleSection {...dontSettle} /> : null}

        {enabled('offerings') && offerings ? <ServiceOfferingsSection {...offerings} /> : null}

        {enabled('quote') && quote ? (
          <ServiceQuoteSection
            heading={quote.heading || 'Crafting your dream home, our promise'}
            quote={quote.quote || ''}
            attribution={quote.attribution || 'Prime Design & Build'}
            image={quote.image || service.image}
          />
        ) : null}

        {enabled('reviews') ? <ReviewsSection /> : null}

        {enabled('prime-difference') ? (
          <ServicePrimeDifferenceSection
            eyebrow={prime.eyebrow}
            heading={prime.heading}
            headingAccent={prime.headingAccent}
            body={prime.body}
            checklist={prime.checklist}
            reasons={prime.reasons}
            socials={undefined}
          />
        ) : null}

        {enabled('testimonial-cards') && testimonialItems?.length ? (
          <ServiceTestimonialCardsSection
            items={testimonialItems.map((item) => ({
              name: item.name,
              quote: item.quote || '',
              avatar: item.avatar,
            }))}
          />
        ) : null}

        {enabled('silicon-valley-loves') ? (
          <ServiceSiliconValleyLovesSection content={siliconValleyLoves} />
        ) : null}

        {enabled('contact') ? <GalleryContact /> : null}

        <ServiceLocationFooter />
      </main>
    </div>
  )
}
