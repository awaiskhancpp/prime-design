import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { projects } from '@/lib/projects'
import { ProjectCard } from './ProjectCard'
import { ProjectsReviews } from './ProjectsReviews'
import { ProjectsTrustIntro } from './ProjectsTrustIntro'

export function ProjectsPage() {
  return (
    <div className="min-h-screen ">
      <SiteHeader tone="light" />
      <section className="pt-20 md:pt-30 ">
        <Section>
          <SectionHeader
            align="center"
            eyebrow="Our projects"
            title="Showcasing our latest remodeling projects in Silicon Valley"
            description="Inspiring home makeovers that reflect your style and enhance your lifestyle."
          />
        </Section>
      </section>

      <Section className="bg-white pt-0">
        <div className="mx-auto grid max-w-6xl gap-x-8 gap-y-10 sm:grid-cols-2">
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
