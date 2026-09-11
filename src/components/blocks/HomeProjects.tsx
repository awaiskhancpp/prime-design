import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'
import { resolveProjects } from '@/lib/projects'

// WordPress homepage grid order (post 2 query post__in) — used to order the
// featured projects so the homepage matches the original site.
const WP_HOMEPAGE_ORDER = [
  'atherton-kitchen-remodeling-projects',
  'full-home-remodeling-los-gatos',
  'sunnyvale-complete-home-renovation',
  'san-mateo-complete-home-remodel',
  'full-home-remodeling-cupertino',
  'san-jose-complete-home-remodel',
]

/**
 * Payload-driven project grid. Projects checked "Featured on homepage" are
 * shown (in the WordPress grid order); when none are checked, the six most
 * recent projects are shown instead. Card images are each project's real
 * featured image from Payload.
 */
export async function HomeProjects({ heading }: { heading?: string }) {
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

  const title = heading || 'Our Latest Remodeling Projects'

  return (
    <Section className="bg-white">
      <SectionHeader align="center" title={title} />

      <div className="mt-10 grid grid-cols-1 gap-1 overflow-hidden  sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((project) => (
          <a
            key={project.slug}
            href={`/project/${project.slug}`}
            className="group relative aspect-[4/3] overflow-hidden bg-ink"
          >
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold leading-snug text-white md:text-base">
              {project.title}
            </p>
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
