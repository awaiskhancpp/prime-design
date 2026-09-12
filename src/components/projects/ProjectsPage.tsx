import { Section } from '@/components/ui/Section'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveProjects } from '@/lib/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectsReviews } from './ProjectsReviews'
import { ProjectsTrustIntro } from './ProjectsTrustIntro'

export async function ProjectsPage() {
  const projects = await resolveProjects()

  // The hero comes from the pages collection record "our-projects" (seeded
  // from WordPress page 339); the hardcoded values below are only a
  // fallback for local runs without a database.
  const page = await resolvePageBySlug('our-projects')
  const hero = page?.hero

  return (
    <div className="min-h-screen ">
      <PageHero
        title={hero?.heading || 'Showcasing our latest remodeling projects in Silicon Valley'}
        description={
          hero?.description ??
          'Inspiring home makeovers that reflect your style and enhance your lifestyle.'
        }
        image={hero?.image || '/services/home-remodeling.jpeg'}
        imageAlt="Completed home remodeling project"
      />

      <Section className="bg-white pt-10 ">
        <div className="grid max-w-[1440px]  gap-x-4 gap-y-6 sm:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <ProjectsTrustIntro />
      <ProjectsReviews />
      <LandscapingServiceAreas />
    </div>
  )
}
