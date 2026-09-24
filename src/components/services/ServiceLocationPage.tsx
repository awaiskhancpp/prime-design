import { ReviewsSection } from './ReviewsSection'
import { Section } from '@/components/ui/Section'
import { ServiceQuoteSection } from './ServiceQuoteSection'
import { mediaUrl } from '@/components/landing/LandingBlockRenderer'
import { ServiceOfferingsSection } from './ServiceOfferingsSection'
import { ServiceVideoSection } from './ServiceVideoSection'
import { ServiceLocationHeroForm } from './ServiceLocationHeroForm'
import { ServiceDontSettleSection } from './sections/ServiceDontSettleSection'
import { ServiceSiliconValleyLovesSection } from './sections/ServiceSiliconValleyLovesSection'
import { ServiceTestimonialCardsSection } from './sections/ServiceTestimonialCardsSection'
import type { ServiceLocation } from '@/lib/serviceLocations'
import type { ServiceDetail } from '@/lib/services'
import { ServicePrimeDifferenceSection } from './sections/ServicePrimeDifferenceSection'
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
  // source). No static fallback — the section only renders Payload content.
  const locVideo = entry.locationVideo
  const video = locVideo?.videoUrl
    ? {
        eyebrow: fill(locVideo.eyebrow, serviceTitle, city),
        title: fill(locVideo.title, serviceTitle, city) || serviceTitle,
        description: fill(locVideo.description, serviceTitle, city),
        tagline: fill(locVideo.tagline, serviceTitle, city),
        videoUrl: locVideo.videoUrl,
        // WordPress defines no poster, but the player preloads nothing, so
        // without one the box renders empty. A still from that same clip now
        // lives on the service-locations record (see
        // scripts/fix-location-video-posters.mjs), so there is no fallback
        // here — blank in Payload renders blank.
        poster: locVideo.poster,
      }
    : undefined

  // "Don't Settle" — service-location tab content only.
  const locDontSettle = entry.dontSettle
  const dontSettle = locDontSettle?.body
    ? {
        eyebrow: fill(locDontSettle.eyebrow, serviceTitle, city) || `${service.title} in ${city}`,
        heading: fill(locDontSettle.heading, serviceTitle, city) || "Don't Settle for a Mediocre",
        headingAccent: fill(locDontSettle.headingAccent, serviceTitle, city) || city,
        body: fill(locDontSettle.body, serviceTitle, city) || '',
        // WordPress uses one photo here on all three family templates
        // (attachment 579). `service.image` is the city marketing graphic, so
        // it is only the last resort.
        image: locDontSettle.image ?? overrides.get('intro')?.image ?? service.image,
        cta: {
          // The button's words come from the record; an empty label means the
          // page shows no button rather than one this file invented.
          label: locDontSettle.ctaLabel,
          href: '#contact',
        },
      }
    : undefined

  // Offerings — only categories with sub-category pages, from the parent
  // service's Payload sub-services block (never static copy).
  const subServicesBlock = service.sections?.find(
    (section) => section && section.blockType === 'sub-services',
  )
  const offerings = subServicesBlock
    ? {
        eyebrow: String((subServicesBlock as { eyebrow?: string }).eyebrow || ''),
        title: String((subServicesBlock as { heading?: string }).heading || ''),
        description: String((subServicesBlock as { description?: string }).description || ''),
        // The buttons are this page's own, read from the location record's
        // Offerings tab — not from the parent service's `sub-services` block,
        // whose pair belongs to the parent page. The live original carries
        // two here, "View our gallery" (→ /gallery) and "Talk to an expert"
        // (→ #contact), and they were hardcoded in this file until now, so
        // no editor could change a word of them. Nothing is substituted if
        // the record is empty: an unset button does not render.
        primaryCta: entry.offerings?.primaryCta,
        secondaryCta: entry.offerings?.secondaryCta,
        // No `image` here on purpose — WordPress bound this section's banner
        // to `{featured_image}`, but the real page only ever showed the 3
        // sub-service cards; the standalone banner was this component
        // rendering the city's marketing graphic a second time, right above
        // the cards that already carry their own images. Removed, cards kept.
        cards: (Array.isArray((subServicesBlock as { items?: unknown[] }).items)
          ? ((subServicesBlock as unknown as { items: unknown[] }).items as Record<
              string,
              unknown
            >[])
          : []
        )
          .map((item) => ({
            title: String(item.title || ''),
            description: String(item.description || ''),
            // `media` is a group (uploaded `asset` + WordPress `sourceUrl`), not a
            // flat object with `url` — reading `media.url` never matched, so every
            // card silently fell back to the page hero. Use the same resolver the
            // service page's renderer uses.
            image: mediaUrl(item.media) ?? service.image,
            href:
              typeof (item.link as { url?: string } | undefined)?.url === 'string'
                ? (item.link as { url: string }).url
                : '#contact',
          }))
          .filter((card) => card.title),
      }
    : undefined

  // Quote — service-location override → service defaults (Payload only).
  const locQuote = entry.quote
  const svcQuote = service.quote
  const quotePayload = {
    heading: locQuote?.heading ?? svcQuote?.heading,
    quote: locQuote?.quote ?? svcQuote?.quote,
    attribution: locQuote?.attribution ?? svcQuote?.attribution,
    image: locQuote?.image ?? svcQuote?.image,
  }
  const quote = quotePayload.quote ? quotePayload : undefined

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
    : undefined

  // Testimonial cards — service-location override → service defaults.
  const testimonialItems = entry.testimonialCards?.items?.length
    ? entry.testimonialCards.items
    : service.testimonialCards?.items

  // Silicon Valley Loves — service-location override → service defaults
  // (Payload only; the section renders nothing without them).
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
      <ServiceLocationHeroForm
        service={service}
        location={entry.location}
        heroOverride={entry.locationHero}
      />
      <main>
        {enabled('video') && video ? (
          <Section>
            <ServiceVideoSection {...video} embedded />
          </Section>
        ) : null}

        {enabled('intro') && dontSettle ? <ServiceDontSettleSection {...dontSettle} /> : null}

        {enabled('offerings') && offerings ? (
          <ServiceOfferingsSection {...offerings} city={city} />
        ) : null}

        {/* WordPress section order differs per service: home pages put the
            Prime Difference BEFORE the Noah quote (WP template order 1525 →
            1160); kitchen/bathroom render quote first. */}
        {entry.serviceSlug === 'home-remodeling' ? (
          <>
            {enabled('prime-difference') && prime ? (
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
            {enabled('quote') && quote ? (
              <ServiceQuoteSection
                // No literals here: the heading and the attribution are the
                // record's own words or nothing at all. Every one of the 45
                // records carries both today, so this changes nothing on the
                // site — it removes the copy that would have hidden it if one
                // day they did not.
                heading={quote.heading}
                quote={quote.quote}
                attribution={quote.attribution}
                image={quote.image || service.image}
              />
            ) : null}
          </>
        ) : (
          <>
            {enabled('quote') && quote ? (
              <ServiceQuoteSection
                // No literals here: the heading and the attribution are the
                // record's own words or nothing at all. Every one of the 45
                // records carries both today, so this changes nothing on the
                // site — it removes the copy that would have hidden it if one
                // day they did not.
                heading={quote.heading}
                quote={quote.quote}
                attribution={quote.attribution}
                image={quote.image || service.image}
              />
            ) : null}
            {enabled('prime-difference') && prime ? (
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
          </>
        )}

        {enabled('reviews') ? <ReviewsSection city={city} /> : null}

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

        {/* No poster: the WordPress contact section's <video> defines only a
            fileUrl, so the clip shows its own first frame. Passing the city's
            featured image here pasted a "Kitchen Remodeling in {City}" graphic
            over a video shot somewhere else. */}
        {enabled('contact') ? <GalleryContact city={city} /> : null}

        <ServiceLocationFooter />
      </main>
    </div>
  )
}
