import { ProjectsReviews } from '@/components/projects/ProjectsReviews'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { blogPosts } from '@/lib/blog'
import { BlogCard } from './BlogCard'

export function BlogPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />

      <section className="pt-20 md:pt-30">
        <Section className="pb-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeader
              eyebrow="Our blog"
              title="See our blog"
              description="This is where we share our knowledge and insights about everything related to remodeling — advice on a remodeling project, options for your home, and updates on the latest trends in the industry."
            />
            <Button href="/contact" variant="outline" className="shrink-0">
              Let&apos;s discuss your project <span aria-hidden>→</span>
            </Button>
          </div>
        </Section>
      </section>

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
