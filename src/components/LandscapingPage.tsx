import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingHero } from '@/components/blocks/LandscapingHero'
import { LandscapingIntro } from '@/components/blocks/LandscapingIntro'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { HomeServices } from './blocks/HomeServices'
import { HomeFeatureBlocks } from './blocks/HomeFeatureBlocks'
import { HomeContact } from './blocks/HomeContact'
import { HomeProjects } from './blocks/HomeProjects'

export function LandscapingPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandscapingHero />
      <LandscapingIntro />
      <HomeProjects />
      {/* <LandscapingServices /> */}
      <HomeServices />
      {/* <LandscapingDifference /> */}

      <HomeFeatureBlocks />
      <HomeContact />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
