// import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { TeamSection } from '@/components/about/TeamSection'
import { resolveTeamMembers } from '@/lib/team'
import { Contact } from '../gallery/Contact'

/**
 * Standalone /team page. The member grid comes from the Payload Team
 * collection (same source the About page's team section uses), so the page
 * renders the real migrated members instead of an empty grid.
 */
export async function TeamPage() {
  const members = await resolveTeamMembers()

  return (
    <div className="min-h-screen bg-white">
      <TeamSection members={members} />
      <Contact />
      <LandscapingServiceAreas />
    </div>
  )
}
