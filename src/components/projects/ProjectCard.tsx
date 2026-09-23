import { PhotoPlateCard } from '@/components/ui/PhotoPlateCard'
import type { Project } from '@/lib/projects'

/**
 * A project on `/our-projects`.
 *
 * ── What the content is ───────────────────────────────────────────────────
 *
 *   title     25–103 characters, and one line at this width for 15 of 18
 *   excerpt   59–106 characters, two lines for 17 of 18
 *   summary   47–180 characters
 *   category  six values, 13–24 characters
 *   location  16–40 characters, every one suffixed ", CA, USA" or similar
 *
 * The body copy is `excerpt`, not `summary`. The card used `summary`, whose
 * 133-character spread is what made the grid ragged: at two clamped lines a
 * 47-character summary left half the block empty while a 180-character one
 * was cut mid-sentence. `excerpt` spans 47 characters end to end and is the
 * field documented as card copy. No CSS fixes a content mismatch that the
 * right field does not have.
 *
 * The title gets two lines as a ceiling. `line-clamp-1` at `text-3xl` cut
 * nine of the eighteen mid-word; the longest lost three quarters of itself.
 *
 * The state and country come off the location — every record carries one,
 * the company works in a single state, and printed in full it set a
 * 36-character line beside a 16-character one for no information.
 *
 * Nothing reserves a fixed height. Holding the title at two lines does line a
 * row up, and with 15 of 18 titles on one line it also opens a blank line
 * under most of the grid — the same empty space, moved. Grid items stretch to
 * the tallest in their row and `mt-auto` drops the footer, so a row already
 * ends on one line whatever the titles do.
 *
 * ── Why it looks like this ────────────────────────────────────────────────
 *
 * The card itself is `ui/PhotoPlateCard`, shared with the landing pages'
 * craftsmanship section. What lives here is the mapping from a project to it:
 * which field goes where, and the three content decisions above. The footer
 * splits the place from the action, which puts the two things a visitor scans
 * for — where it is and how to see it — on one line.
 */

/** The company works in one state; printing it on every card says nothing. */
const place = (location: string) =>
  location.replace(/,\s*(CA|California)(\s*,\s*USA)?\s*$/i, '').trim() || location

export function ProjectCard({
  project,
  linked = true,
}: {
  project: Project
  /**
   * Whether the card navigates. The Google Ads landing pages pass `false`:
   * the original WordPress tiles there were not clickable either, because a
   * card that leaves for a project page is an ad click that never reaches the
   * form. The action label goes with the link rather than staying behind as a
   * "See this Project" that does nothing when pressed.
   */
  linked?: boolean
}) {
  return (
    <PhotoPlateCard
      href={linked ? `/project/${project.slug}` : undefined}
      image={project.heroImage}
      imageAlt={project.title}
      eyebrow={project.category}
      title={project.title}
      footerLeft={place(project.location)}
      actionLabel={linked ? 'See this Project' : undefined}
    >
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-ink-2/70">
        {project.excerpt || project.summary}
      </p>
    </PhotoPlateCard>
  )
}
