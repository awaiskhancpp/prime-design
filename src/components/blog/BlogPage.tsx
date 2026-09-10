import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { resolveBlogPosts } from '@/lib/blog'
import { BlogCard } from './BlogCard'

export async function BlogPage() {
  const blogPosts = await resolveBlogPosts()

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title="See our blog"
        description={
          <>
            This is where we share our knowledge and insights about everything related to
            remodeling. Whether you're looking for <strong>advice</strong> on a remodeling
            project, <em>exploring options for your home</em>, or <strong>seeking updates</strong>{' '}
            on the latest trends in the industry, you've come to the right place!
          </>
        }
        image="/services/kitchen-remodeling.jpeg"
        imageAlt="Kitchen remodeling project"
        cta={{ label: "Let's discuss your project", href: '/contact' }}
      />

      <Section className="bg-white pt-0">
        <div className=" grid  gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>

      <ProjectsReviews />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
