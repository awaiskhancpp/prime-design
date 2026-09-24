import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import type { Page } from '@/lib/pages'
import { resolveServices } from '@/lib/services'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { PageSections, type PageSectionContext } from './PageSections'

/**
 * Generic page renderer. It renders the same section blocks as the homepage,
 * About and Gallery pages, so any section can be used on any page. Pages that
 * also have a bespoke route (home/about/gallery) are rendered by that route.
 *
 * It renders no site chrome of its own. `FrontendTemplate` is the single place
 * that decides whether a page gets the banner, header, CTA and footer, and it
 * excludes Google Ads pages. This component used to re-add `SiteHeader`,
 * `LandscapingCta` and `SiteFooter` for exactly those pages, which cancelled
 * the exclusion out: an ads page was stripped of the chrome by the template
 * and then handed it straight back here. Two components rendering the same
 * chrome is how they drift apart — the copy here never received the `tone`
 * the template works out, so it was always the dark variant.
 */
export async function PayloadPage({ page }: { page: Page }) {
  const settings = await resolveSiteSettings()
  const services = await resolveServices()

  const context: PageSectionContext = {
    isGoogleAdsPage: page.isGoogleAdsPage,
    services,
    socialLinks: settings.socialLinks,
    phone: settings.phone,
  }

  // The `hero` group is a legacy of the first page template; pages built from
  // sections carry their hero as a section instead.
  const hasHeroSection = page.layout.some((section) => section.type === 'hero')

  return (
    <div className="min-h-screen bg-white">
      {!hasHeroSection ? (
        <PageHero
          eyebrow={page.hero?.eyebrow}
          title={page.hero?.heading || page.title}
          description={page.hero?.description}
          image={page.hero?.image}
          imageAlt={page.title}
          cta={
            page.hero?.cta?.label
              ? { label: page.hero.cta.label, href: page.hero.cta.href || '/contact' }
              : undefined
          }
        />
      ) : null}

      <main>
        <PageSections sections={page.layout} context={context} />
      </main>

      <LandscapingServiceAreas linked={!page.isGoogleAdsPage} />
    </div>
  )
}
