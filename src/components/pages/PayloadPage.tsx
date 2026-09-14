import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import type { Page } from '@/lib/pages'
import { resolveServices } from '@/lib/services'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { PageSections, type PageSectionContext } from './PageSections'

/**
 * Generic page renderer. It renders the same section blocks as the homepage,
 * About and Gallery pages, so any section can be used on any page. Pages that
 * also have a bespoke route (home/about/gallery) are rendered by that route.
 */
export async function PayloadPage({ page }: { page: Page }) {
  // Google Ads pages are excluded from the shared layout chrome, so they
  // keep rendering their own header, CTA and footer here. Regular pages
  // get all of that from the layout instead.
  const isAdsPage = page.isGoogleAdsPage
  const settings = await resolveSiteSettings()
  const services = await resolveServices()

  const context: PageSectionContext = {
    services,
    socialLinks: settings.socialLinks,
    phone: settings.phone,
  }

  // The `hero` group is a legacy of the first page template; pages built from
  // sections carry their hero as a section instead.
  const hasHeroSection = page.layout.some((section) => section.type === 'hero')

  return (
    <div className="min-h-screen bg-white">
      {isAdsPage ? <SiteHeader /> : null}

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

      <LandscapingServiceAreas />
      {isAdsPage ? (
        <>
          <LandscapingCta />
          <SiteFooter />
        </>
      ) : null}
    </div>
  )
}
