import { TestimonialsSpotlight } from './TestimonialsSpotlight'
import { resolveFeaturedTestimonials } from '@/lib/testimonialsCollection.server'

/**
 * Server wrapper that loads the featured testimonials and renders the
 * spotlight marquee.
 *
 * The landing pages reach the section through this wrapper because their
 * block renderer is a plain synchronous map with no data context. The
 * Testimonials page does not use it — that page has the reviews already and
 * passes its own copy from the `testimonials-spotlight` block.
 *
 * The copy below is the landing pages' own wording, passed explicitly rather
 * than defaulted inside the shared component, so the section itself carries no
 * hardcoded strings. Migrating this copy into the landing-page blocks is a
 * separate task.
 */
export async function TestimonialsSpotlightSection({ heading }: { heading?: string }) {
  const reviews = await resolveFeaturedTestimonials(12)

  return (
    <TestimonialsSpotlight
      reviews={reviews}
      eyebrow="Testimonials that matter"
      heading={heading ?? 'Real results, real people.'}
      ctaLabel="See our projects"
      ctaHref="/our-projects"
      ctaNote="Ready to talk?"
      panelLabel="What homeowners are saying"
    />
  )
}
