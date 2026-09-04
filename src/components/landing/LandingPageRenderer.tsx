import type { LandingPage } from '@/lib/landingPages'
import website from '../../../website.json'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { LandingLuxuryCta } from './LandingLuxuryCta'
import { LandingServiceAreasSection } from './LandingServiceAreasSection'
import { LandingBlockRenderer } from './LandingBlockRenderer'

export function LandingPageRenderer({ page }: { page: LandingPage }) {
  const hasServiceAreas = page.sections.some((section) => section.blockType === 'service-areas')
  const hasLuxuryCta = page.sections.some((section) => section.blockType === 'luxury-cta')
  return (
    <div className="min-h-screen bg-white">
      <main>
        <LandingBlockRenderer sections={page.sections} />
        {!hasServiceAreas ? (
          <LandingServiceAreasSection
            heading={website.serviceAreas.heading}
            areas={website.serviceAreas.cities.map((label) => ({ label }))}
          />
        ) : null}
        {!hasLuxuryCta ? (
          <LandingLuxuryCta
            eyebrow={website.about.kicker}
            heading={website.about.heading}
            body={website.about.body}
            link={website.about.ctaHref}
            label={website.about.ctaLabel}
          />
        ) : null}
      </main>
    </div>
  )
}
