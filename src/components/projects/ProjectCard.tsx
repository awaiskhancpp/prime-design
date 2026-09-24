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
 * The body copy is the project's own write-up where it has one.
 *
 * Six of the eighteen carry a real description on the original site — the
 * paragraphs the project page prints, 47 to 509 characters, some with inline
 * links — and that is what the card should show, because it is what the
 * project actually says about itself. The other twelve have no write-up on
 * the original either, so they keep the `excerpt` they show today; nothing
 * is invented to fill the gap.
 *
 * `summary` remains the last resort. It used to be first, and its
 * 133-character spread is what made the grid ragged: at two clamped lines a
 * 47-character summary left half the block empty while a 180-character one
 * was cut mid-sentence.
 *
 * Two lines, not three. With the longer descriptions in play a third line
 * pushed the taller cards well past their neighbours; clamped at two, every
 * card's plate is the same depth whichever field filled it.
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
      {/* Two lines, reserved at 48px. Seventeen of the eighteen fill both;
          the one that does not (San Jose's 47-character write-up) would
          otherwise render a 24px block and pull its footer up level with the
          bodies of the cards beside it. The card itself is the same height
          either way — the grid stretches it — so what the reservation fixes
          is the ragged inside of the plate, not the outside of the card. */}
      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-ink-2/70">
        {project.description || project.excerpt || project.summary}
      </p>
    </PhotoPlateCard>
  )
}
