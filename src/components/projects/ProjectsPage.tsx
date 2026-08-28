import { Section } from '@/components/ui/Section'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { resolveProjects } from '@/lib/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectsReviews } from './ProjectsReviews'
import { ProjectsTrustIntro } from './ProjectsTrustIntro'

export async function ProjectsPage() {
  const projects = await resolveProjects()

  return (
    <div className="min-h-screen ">
      <PageHero
        eyebrow="Our projects"
        title="Showcasing our latest remodeling projects in Silicon Valley"
        description="Inspiring home makeovers that reflect your style and enhance your lifestyle."
        image="/services/home-remodeling.jpeg"
        imageAlt="Completed home remodeling project"
      />

      <Section className="bg-white pt-0">
        <div className="grid max-w-[1440px]  gap-x-4 gap-y-6 sm:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <ProjectsTrustIntro />
      <ProjectsReviews />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
