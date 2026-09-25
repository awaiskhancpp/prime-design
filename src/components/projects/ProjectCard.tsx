import Image from '@/components/ui/Image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import type { Project } from '@/lib/projects'

/**
 * A project on `/our-projects`.
 *
 * ── Why it looks like this ────────────────────────────────────────────────
 *
 * The work is the subject, so the photograph is the card and the copy sits on
 * it. Until now this grid used `ui/PhotoPlateCard` — a photo with a paper
 * plate of copy beneath it, carrying a category, a headline, a two-line
 * standfirst and a footer. That is the shape of an article, and it made the
 * portfolio read as a blog index. The plate has moved to `BlogCard`, where it
 * belongs.
 *
 * It is deliberately not the homepage's project tile either, which lays its
 * copy over a gradient that covers the whole frame and prints the excerpt.
 * Here the copy sits in a solid ink band pinned to the foot of the picture, so
 * the photograph above it is never veiled, and the category rides on the image
 * as a brass chip rather than being another line of text. Three portfolio
 * surfaces, three treatments — but see the note at the foot of this comment.
 *
 * ── What the content is ───────────────────────────────────────────────────
 *
 *   title     25–103 characters, clamped to two lines
 *   category  six values, 13–24 characters, the chip on the photograph
 *   location  16–40 characters, every one suffixed ", CA, USA" or similar
 *
 *   description 47–509 characters where a project has its own write-up, then
 *               the excerpt, then the summary — clamped and reserved at two
 *               lines. Its 133-character spread is exactly why it is reserved
 *               rather than flowed: unreserved, it was what made the old grid
 *               ragged.
 *
 * `4/5` portrait: rooms photograph tall, and the frame gives the band
 * something to sit against without eating the picture.
 *
 * KNOWN DUPLICATE, flagged rather than fixed here: `blocks/HomeProjects.tsx`
 * builds its own project tile inline — same idea, gradient instead of a band,
 * no category chip, and it prints the excerpt. Two components rendering a
 * project card is exactly what §2 of CLAUDE.md is about, and the homepage one
 * should almost certainly become this component with a prop. That is a change
 * to how the homepage renders, so it needs saying out loud first.
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
  const body = (
    <>
      <Image
        src={project.heroImage}
        alt={project.title}
        fill
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
      />

      {project.category ? (
        <span className="absolute left-4 top-4 z-10 bg-brass px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink">
          {project.category}
        </span>
      ) : null}

      {/*
        A solid band rather than a gradient over the whole frame: the picture
        stays a picture, and the copy has a ground of its own that does not
        depend on what the photograph happens to be doing behind it.

        Fully opaque, not the 95% it started at. At two lines of 13px body
        copy the difference is not subtle — the Prime watermark printed on
        some of these photographs showed through the band behind the text.
        The card's hover affordances are the photograph's zoom, the arrow's
        slide and the brass "View"; the band does not need to join in.
      */}
      <div className="relative z-10 mt-auto bg-ink p-4 sm:p-5">
        {/*
          Both blocks below are reserved at exactly two lines, and that is the
          whole point of this card's layout. The frame is a fixed 4:5, so the
          band is pinned to the bottom and grows upward — which means a
          two-line title lifts its band's top edge above its neighbours', and a
          row reads as one card up, one card down. Reserving the lines pins the
          band's top edge, the description and the footer to the same height on
          every card in the row, whatever length the copy happens to be.

          `leading-6` / `md:leading-7` rather than `leading-snug` so the
          reserve is a round number that cannot drift from the type: two lines
          are 48px and 56px, which is `min-h-12` and `md:min-h-14` exactly.

          The cost is a blank line under a one-line title. That is the same
          space either way — flowed, it appears as a jagged row of bands; here
          it sits inside the card where it reads as breathing room.
        */}
        <h2 className="line-clamp-2 min-h-12 font-display text-lg font-medium leading-6 text-white md:min-h-14 md:text-xl md:leading-7">
          {project.title}
        </h2>

        {/*
          Rendered even when empty so the reserve holds. The project's own
          write-up where it has one, then the excerpt, then the summary — the
          order the old card used, and the reason it is an order at all is that
          only six of the eighteen carry a real description on the original
          site and nothing is invented to fill the rest.
        */}
        <p className="mt-2 line-clamp-2 min-h-10 text-[13px] leading-5 text-white/65">
          {project.description || project.excerpt || project.summary}
        </p>

        <div className="mt-3 flex items-end justify-between gap-3 border-t border-white/10 pt-3">
          <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-[0.14em] text-white/55">
            {place(project.location)}
          </span>
          {linked ? (
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass">
              View
              <ArrowRight
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
                aria-hidden
              />
            </span>
          ) : null}
        </div>
      </div>
    </>
  )

  const frame = 'group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-ink'

  if (!linked) {
    return <article className={frame}>{body}</article>
  }

  return (
    <article className={frame}>
      <Link
        href={`/project/${project.slug}`}
        className="absolute inset-0 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-2"
        aria-label={project.title}
      />
      {body}
    </article>
  )
}
