import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { TeamSection } from '@/components/about/TeamSection'

export function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />
      <TeamSection />
      <HomeContact />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
