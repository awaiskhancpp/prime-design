import Image from '@/components/ui/Image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'
import { resolveProjects } from '@/lib/projects'

// WordPress homepage grid order. The section's Bricks query is
// `post__in: 2754, 2502, 2133, 2449, 2448, 2220`, and `post__in` is the
// order WordPress renders them in — Cupertino (2133) is third, not fifth as
// this list previously had it.
const WP_HOMEPAGE_ORDER = [
  'atherton-kitchen-remodeling-projects', // 2754
  'full-home-remodeling-los-gatos', // 2502
  'full-home-remodeling-cupertino', // 2133
  'sunnyvale-complete-home-renovation', // 2449
  'san-mateo-complete-home-remodel', // 2448
  'san-jose-complete-home-remodel', // 2220
]

/**
 * Payload-driven project grid. Projects checked "Featured on homepage" are
 * shown (in the WordPress grid order); when none are checked, the six most
 * recent projects are shown instead. Card images are each project's real
 * featured image from Payload.
 */
export async function HomeProjects({
  eyebrow,
  heading,
  headingHighlight,
}: {
  /** The section's kicker, from the `projects` block on the homepage record. */
  eyebrow?: string
  heading?: string
  headingHighlight?: string
}) {
  const projects = await resolveProjects()
  const featured = projects.filter((project) => project.featured)
  const shown = (featured.length ? featured : projects).slice(0, 6)

  if (featured.length) {
    shown.sort((a, b) => {
      const ai = WP_HOMEPAGE_ORDER.indexOf(a.slug)
      const bi = WP_HOMEPAGE_ORDER.indexOf(b.slug)
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi)
    })
  }

  const title = heading ?? ''

  return (
    <Section className="bg-white">
      <SectionHeader
        align="center"
        eyebrow={eyebrow}
        title={title}
        titleHighlight={headingHighlight}
      />

      <div className="mt-10 grid grid-cols-1 gap-1 overflow-hidden  sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <a
            key={project.slug}
            href={`/project/${project.slug}`}
            /* Taller than the old 4:3 tile, and deliberately not the
               `/services` card: that one is a white card whose copy is
               hidden until hover, with the title below the photo. This is a
               single photographic tile — the copy sits permanently on the
               image, over a gradient, and the frame is 4:5 rather than the
               3:4 the services cards use. */
            className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-ink"
          >
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />

            {/* Deepens on hover so the copy stays legible as the photo
                moves underneath it. */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-transparent opacity-55 transition-opacity duration-500 group-hover:opacity-100"
            />

            <div className="relative p-5 md:p-6">
              {/* {project.location ? (
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brass">
                  {project.location}
                </p>
              ) : null} */}

              <h3 className="mt-2 font-display text-xl font-medium leading-snug text-white md:text-xl">
                {project.title}
              </h3>

              {/* No clamp — these excerpts are written short enough to show
                  in full at every width. */}
              {project.excerpt ? (
                <p className="mt-2 text-sm leading-6 text-white/75">{project.excerpt}</p>
              ) : null}

              <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 group-hover:text-brass">
                View project
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            </div>
          </a>
        ))}
      </div>
      <div className="flex justify-center">
        <Button href="/our-projects" variant="secondary" className="mt-7">
          See More Projects
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Section>
  )
}
