import { Section } from '@/components/ui/Section'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { resolvePageBySlug } from '@/lib/pages'
import { resolveProjects } from '@/lib/projects'
import { resolveSiteSettings } from '@/lib/siteSettings'
import { ProjectCard } from './ProjectCard'
import { ProjectsReviewsSection } from './ProjectsReviewsSection'
import { ProjectsTrustIntro } from './ProjectsTrustIntro'

export async function ProjectsPage() {
  const projects = await resolveProjects()

  // The hero comes from the pages collection record "our-projects"; the trust
  // section's copy comes from Site Settings → Trust Section.
  const page = await resolvePageBySlug('our-projects')
  const hero = page?.hero
  const settings = await resolveSiteSettings()
  const trust = settings.trustIntro

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
        {/*
          Two up until `xl`, not `sm`. The grid went straight from one column
          to three at 640px, which left each card about 230px wide through the
          whole tablet range and pushed most titles past four lines — the other
          half of why this grid looked ragged. Three up at 1024 was not much
          better: 330px columns put two thirds of the excerpts over their two
          lines. From 1280 the columns are wide enough that titles sit on one
          line and excerpts land on two.
        */}
        <div className="grid max-w-[1440px] gap-x-4 gap-y-6 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
      </Section>

      <ProjectsTrustIntro
        eyebrow={trust?.eyebrow}
        heading={trust?.heading}
        body={trust?.body}
        image={trust?.image}
        stats={trust?.stats}
        buttons={trust?.buttons}
      />
      <ProjectsReviewsSection />
      <LandscapingServiceAreas />
    </div>
  )
}
