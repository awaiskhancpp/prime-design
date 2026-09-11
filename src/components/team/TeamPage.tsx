// import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { TeamSection } from '@/components/about/TeamSection'
import { Contact } from '../gallery/Contact'

export function TeamPage() {
  return (
    <div className="min-h-screen bg-white">
      <TeamSection />
      <Contact />
      <LandscapingServiceAreas />
    </div>
  )
}
