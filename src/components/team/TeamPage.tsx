// import { HomeContact } from '@/components/blocks/HomeContact'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { TeamSection } from '@/components/about/TeamSection'
import { resolveTeamMembers } from '@/lib/team'
import { Contact } from '../gallery/Contact'

/**
 * Standalone /team page. The member grid comes from the Payload Team
 * collection (same source the About page's team section uses), so the page
 * renders the real migrated members instead of an empty grid.
 *
 * `data-light-chrome`: this page opens on plain white, not a dark hero, so
 * the overlaid header needs dark text. `FrontendTemplate` already picks
 * `tone="light"` correctly for `/team`, but `SiteHeader`'s mobile bar ignores
 * `tone` (it assumes a dark photo is always behind it) — the attribute is
 * what actually recolours that bar. See the CSS rule in `styles.css`.
 */
export async function TeamPage() {
  const members = await resolveTeamMembers()

  return (
    <div data-light-chrome className="min-h-screen bg-white">
      <TeamSection members={members} />
      <Contact />
      <LandscapingServiceAreas />
    </div>
  )
}
