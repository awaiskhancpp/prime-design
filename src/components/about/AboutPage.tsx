import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { resolveTeamMembers } from '@/lib/team'

/**
 * About page. Its sections live in the Pages collection (record `about`), so
 * they can be added, reordered and removed from the admin panel like any
 * other page. The team cards come from the Team collection.
 */
export async function AboutPage() {
  const page = await resolvePageBySlug('about')
  const settings = await resolveSiteSettings()
  const members = await resolveTeamMembers()

  // `socialLinks` is needed by the review-platform section; it comes from
  // Site Settings so the links match the homepage badge row.
  const context: PageSectionContext = {
    members,
    phone: settings.phone,
    socialLinks: settings.socialLinks,
  }

  return (
    <div className="min-h-screen ">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
