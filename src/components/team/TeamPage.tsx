import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageSections } from '@/components/pages/PageSections'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveTeamMembers } from '@/lib/team'

import { Contact } from '../gallery/Contact'

/**
 * Standalone /team page.
 *
 * Everything above the contact band is the `team` page record's layout,
 * rendered by the shared `PageSections` — the same renderer the About page's
 * identical section goes through, so there is one Team section on this site,
 * not two.
 *
 * It used to render `<TeamSection>` directly with only `members` passed, and
 * `TeamSection` takes its headings from a `teamIntro` prop: with nothing
 * supplying one, the page opened on an empty eyebrow, an empty `<h2>` and an
 * empty intro, and the member grid simply began. WordPress opens it with
 * "Driven by Passion, Guided by Expertise / Meet our exceptional Team", which
 * is now in the CMS where the About page's copy already was.
 *
 * `data-light-chrome`: this page opens on plain white, not a dark hero, so
 * the overlaid header needs dark text. `FrontendTemplate` already picks
 * `tone="light"` correctly for `/team`, but `SiteHeader`'s mobile bar ignores
 * `tone` (it assumes a dark photo is always behind it) — the attribute is
 * what actually recolours that bar. See the CSS rule in `styles.css`.
 */
export async function TeamPage() {
  const [members, page] = await Promise.all([resolveTeamMembers(), resolvePageBySlug('team')])

  return (
    <div data-light-chrome className="min-h-screen bg-white">
      <PageSections sections={page?.layout ?? []} context={{ members }} />
      <Contact />
      <LandscapingServiceAreas />
    </div>
  )
}
