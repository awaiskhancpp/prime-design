import { getFeaturedTestimonials } from '@/lib/testimonials.server'
import { ProjectsReviews } from '@/components/projects/ProjectsReviews'

// Server-side reviews loader: pulls the featured review quotes from the
// Payload `testimonials` collection so the "See what people in Silicon Valley
// are saying about us" section is CMS-driven.
export async function ReviewsSection() {
  const featured = await getFeaturedTestimonials()
  if (!featured.length) return null
  return <ProjectsReviews testimonials={featured} />
}
