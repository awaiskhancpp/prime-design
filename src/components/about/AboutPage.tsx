import { SiteFooter } from '@/components/layout/SiteFooter'
import { AboutHero } from './AboutHero'
import { CoreValues } from './CoreValues'
import { TeamSection } from './TeamSection'

export function AboutPage() {
  return (
    <div className="min-h-screen bg-paper">
      <AboutHero />

      <TeamSection />
      <CoreValues />
      <SiteFooter />
    </div>
  )
}
