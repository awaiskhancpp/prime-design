import { SiteFooter } from '@/components/layout/SiteFooter'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { AboutHero } from './AboutHero'
import { AboutFaq } from './AboutFaq'
import { CoreValues } from './CoreValues'
import { ExpertsSection } from './ExpertsSection'
import { GuidingPrinciple } from './GuidingPrinciple'
import { TeamSection } from './TeamSection'

export function AboutPage() {
  return (
    <div className="min-h-screen ">
      <AboutHero />

      <TeamSection />
      <GuidingPrinciple />
      <CoreValues />
      <ExpertsSection />
      <AboutFaq />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
