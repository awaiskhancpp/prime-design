import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { AboutHero } from './AboutHero'
import { AboutFaq } from './AboutFaq'
import { CoreValues } from './CoreValues'
import { ExpertsSection } from './ExpertsSection'
import { GuidingPrinciple } from './GuidingPrinciple'
import { TeamSection } from './TeamSection'

export async function AboutPage() {
  const settings = await resolveSiteSettings()
  return (
    <div className="min-h-screen ">
      <AboutHero />

      <TeamSection />
      <GuidingPrinciple />
      <CoreValues />
      <ExpertsSection />
      <AboutFaq phone={settings.phone} />
      <LandscapingServiceAreas />
    </div>
  )
}
