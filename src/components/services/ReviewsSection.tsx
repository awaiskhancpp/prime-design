import { ProjectsReviewsSection } from '@/components/projects/ProjectsReviewsSection'

/**
 * The reviews slot on service and service-location pages.
 *
 * It used to load the featured reviews itself, which meant two code paths
 * fetched the same collection and only one of them knew about the platform
 * marks in Site Settings. It now just names the section's city — the
 * WordPress `{acf_city}` in the heading — and lets the one shared loader do
 * the reading.
 */
export async function ReviewsSection({ city }: { city?: string }) {
  return <ProjectsReviewsSection city={city} />
}
