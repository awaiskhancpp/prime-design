import { ProjectsReviews, type ReviewSourceIcons, type ReviewSummary } from './ProjectsReviews'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { getSectionReviews } from '@/lib/testimonials.server'

/**
 * The server half of "See what people are saying about us".
 *
 * The section used to be rendered as a bare client component, which meant it
 * could only reach `website.json` — every page showed the same eight hardcoded
 * reviews no matter what was in the CMS. Payload is read here, in a server
 * component, and the client half is left purely presentational:
 *
 *   - the reviews come from the `reviews` collection — every review on a
 *     main page, and on a service page the ones about that service plus the
 *     general ones (see `getSectionReviews`), Featured first — and
 *   - the platform marks and the headline figures come from
 *     Site Settings → Reviews.
 *
 * Renders nothing when there are no reviews, rather than inventing a
 * list — the section should disappear, not lie.
 */
export async function ProjectsReviewsSection({
  city,
  serviceSlug,
}: {
  city?: string
  /** The service page this is on; omitted on main pages, which show every review. */
  serviceSlug?: string
}) {
  const [testimonials, settings] = await Promise.all([
    getSectionReviews({ serviceSlug }),
    resolveSiteSettings(),
  ])

  if (!testimonials.length) return null

  const reviews = settings.reviews
  const sourceIcons: ReviewSourceIcons | undefined = reviews
    ? { google: reviews.googleIcon, yelp: reviews.yelpIcon }
    : undefined
  const summary: ReviewSummary | undefined = reviews
    ? {
        googleRating: reviews.googleRating,
        googleReviewCount: reviews.googleReviewCount,
        yelpRating: reviews.yelpRating,
        yelpReviewCount: reviews.yelpReviewCount,
      }
    : undefined

  return (
    <ProjectsReviews
      testimonials={testimonials}
      sourceIcons={sourceIcons}
      summary={summary}
      profileLinks={settings.socialLinks}
      city={city}
    />
  )
}
