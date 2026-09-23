import Image from '@/components/ui/Image'

import { ProjectCard } from '@/components/projects/ProjectCard'
import { PhotoPlateCard } from '@/components/ui/PhotoPlateCard'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { resolveProjects } from '@/lib/projects'

type ProjectItem = {
  title: string
  image?: string
  link?: string
}

/** `/project/kitchen-remodeling-hayward` -> `kitchen-remodeling-hayward`. */
const slugFromLink = (link?: string) => link?.match(/\/project\/([^/?#]+)/)?.[1]

/**
 * The "Our Projects" grid on the Google Ads landing pages.
 *
 * Every item in this block points at a real project — the CMS stores the link
 * as `/project/{slug}` — but the block itself only carries a title, an image
 * and that link. The tile it used to render showed exactly that: a photograph
 * with the title in a small white label floating over its top corner, and
 * nothing else. On a page whose whole job is to convert an ad click, the
 * strongest proof on it was reduced to a caption.
 *
 * So each item is matched back to its project by the slug in its own link and
 * rendered with `ProjectCard`, the same card `/our-projects` uses. The
 * category, the place and the excerpt are then real fields read from the
 * project record rather than anything invented here, and the landing pages
 * stop having a second, poorer way of showing the same work.
 *
 * An item whose slug matches nothing still renders — as the same card with
 * only what the block actually has. It is a missing record, not a reason to
 * drop the project from the page.
 *
 * Nothing here is clickable, which matches the WordPress originals: these
 * tiles never linked anywhere. A landing page exists to convert the ad click
 * it just paid for, and every card that offers a way off the page is a way to
 * lose it. The cards still carry the category, the place and the excerpt —
 * they are proof, not navigation — so the "See this Project" action is absent
 * rather than present and inert.
 */
export async function LandingProjectGridSection({
  eyebrow,
  eyebrowIcon,
  heading,
  description,
  items,
}: {
  eyebrow?: string
  eyebrowIcon?: string
  heading?: string
  description?: string
  items: ProjectItem[]
}) {
  if (!items.length) return null

  const projects = await resolveProjects()
  const bySlug = new Map(projects.map((project) => [project.slug, project]))

  return (
    <Section className="bg-white">
      {/* The site's one header component, centred. The heading and the
          description used to sit in two columns of a split row, which put the
          section's own summary off to the right of its title as though it
          belonged to something else. `eyebrow` takes nodes, so the WordPress
          icon-box SVG rides with its label instead of being dropped. */}
      {heading ? (
        <SectionHeader
          align="center"
          size="lg"
          eyebrow={
            eyebrow || eyebrowIcon ? (
              <span className="inline-flex items-center gap-2">
                {eyebrowIcon ? (
                  <Image
                    src={eyebrowIcon}
                    alt=""
                    width={16}
                    height={16}
                    className="h-4 w-4"
                    unoptimized={
                      eyebrowIcon.startsWith('http') || eyebrowIcon.includes('/api/media/file/')
                    }
                    aria-hidden="true"
                  />
                ) : null}
                {eyebrow}
              </span>
            ) : undefined
          }
          title={heading}
          description={description}
        />
      ) : null}

      {/* The same breakpoints the projects grid uses, so a card is never asked
          to hold a title in a column too narrow for it. */}
      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          const project = bySlug.get(slugFromLink(item.link) ?? '')

          if (project) return <ProjectCard key={item.title} project={project} linked={false} />

          // No matching record: the same card, carrying only what the block has.
          return (
            <PhotoPlateCard
              key={item.title}
              image={item.image}
              imageAlt={item.title}
              title={item.title}
            />
          )
        })}
      </div>
    </Section>
  )
}
