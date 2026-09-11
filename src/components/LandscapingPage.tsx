import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingHero } from '@/components/blocks/LandscapingHero'
import { LandscapingIntro } from '@/components/blocks/LandscapingIntro'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { HomeServices } from './blocks/HomeServices'
import { HomeFeatureBlocks } from './blocks/HomeFeatureBlocks'
import { HomeContact } from './blocks/HomeContact'
import { HomeProjects } from './blocks/HomeProjects'
import { LandscapingDifference } from './blocks/LandscapingDifference'
import { TopBanner } from './layout/TopBanner'

export function LandscapingPage() {
  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <LandscapingHero />
      <LandscapingIntro />
      <LandscapingDifference />
      <HomeProjects />
      {/* <LandscapingServices /> */}
      <HomeServices />

      <HomeFeatureBlocks />
      <HomeContact />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
