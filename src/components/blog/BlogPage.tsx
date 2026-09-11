import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { resolveBlogPosts } from '@/lib/blog'
import { resolvePageBySlug } from '@/lib/pages'
import { BlogCard } from './BlogCard'
import { ServiceEstimateCta } from '../services/ServiceEstimateCta'

export async function BlogPage() {
  const blogPosts = await resolveBlogPosts()

  // The hero comes from the pages collection record "blog" (seeded from
  // WordPress page 1670); the hardcoded values below are only a fallback
  // for local runs without a database.
  const page = await resolvePageBySlug('blog')
  const hero = page?.hero

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title={hero?.heading || 'See our blog'}
        description={
          hero?.description ?? (
            <>
              This is where we share our knowledge and insights about everything related to
              remodeling. Whether you&apos;re looking for <strong>advice</strong> on a remodeling
              project, <em>exploring options for your home</em>, or{' '}
              <strong>seeking updates</strong> on the latest trends in the industry, you&apos;ve
              come to the right place!
            </>
          )
        }
        image={hero?.image || '/services/kitchen-remodeling.jpeg'}
        imageAlt="Kitchen remodeling project"
        cta={
          hero?.cta?.label
            ? { label: hero.cta.label, href: hero.cta.href || '/contact' }
            : { label: "Let's discuss your project", href: '/contact' }
        }
      />

      <Section className="bg-white pt-0">
        <div className=" grid  gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
      <ServiceEstimateCta />
      <ProjectsReviews />
      <LandscapingServiceAreas />
    </div>
  )
}
