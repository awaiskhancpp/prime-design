import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveServices } from '@/lib/services'
import { resolveProjectHrefByVideo } from '@/lib/projects'
import { resolveSiteSettings } from '@/lib/siteSettings'

// WordPress homepage card order (the six main services; kitchen style
// sub-pages, finance and comprehensive are not homepage cards).
const HOMEPAGE_SERVICE_SLUGS = [
  'home-remodeling',
  'kitchen-remodeling',
  'adu',
  'additions',
  'complete-renovation',
  'bathroom-remodeling',
]

/**
 * Homepage. Its sections live in the Pages collection (record `home`), so
 * they can be added, reordered and removed from the admin panel like any
 * other page.
 */
export async function LandscapingPage() {
  const page = await resolvePageBySlug('home')
  const settings = await resolveSiteSettings()
  const services = (await resolveServices()).filter((service) =>
    HOMEPAGE_SERVICE_SLUGS.includes(service.slug),
  )
  services.sort(
    (a, b) => HOMEPAGE_SERVICE_SLUGS.indexOf(a.slug) - HOMEPAGE_SERVICE_SLUGS.indexOf(b.slug),
  )

  // Each walkthrough clip in the difference carousel is a project video; the
  // map lets that section link straight to the project it was filmed on.
  const projectHrefByVideo = await resolveProjectHrefByVideo()

  const context: PageSectionContext = {
    services,
    socialLinks: settings.socialLinks,
    projectHrefByVideo,
  }

  return (
    <div className="min-h-screen bg-white">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
