import { getFeaturedTestimonials } from '@/lib/testimonials.server'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'

// Server-side reviews loader: pulls the featured review quotes from the
// Payload `testimonials` collection so the "See what people in {City}
// are saying about us" section is CMS-driven. `city` restores the
// WordPress {acf_city} heading on location pages.
export async function ReviewsSection({ city }: { city?: string }) {
  const featured = await getFeaturedTestimonials()
  if (!featured.length) return null
  return <ProjectsReviews testimonials={featured} city={city} />
}
