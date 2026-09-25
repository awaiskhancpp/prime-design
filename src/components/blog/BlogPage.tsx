import { ProjectsReviewsSection } from '@/components/projects/ProjectsReviewsSection'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { resolveBlogPosts } from '@/lib/blog'
import { richTextHasContent } from '@/lib/richText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { resolvePageBySlug } from '@/lib/pages'
import type { PageSection } from '@/lib/pageSections'
import { BlogCard } from './BlogCard'
import { ServiceEstimateCta } from '../services/ServiceEstimateCta'

export async function BlogPage() {
  const blogPosts = await resolveBlogPosts()

  // The hero comes from the pages collection record "blog" (seeded from
  // WordPress page 1670); the hardcoded values below are only a fallback
  // for local runs without a database. WordPress has no hero image here,
  // so `hero.image` was set in Payload to a photo from the blog itself
  // (see `scripts/set-blog-hero-image.ts`) and stays editable there.
  const page = await resolvePageBySlug('blog')
  const hero = page?.hero

  // The free-estimate band is a WordPress template (tpl 1174) inserted on
  // page 1670. Its copy lives in Payload as a `cta` layout block on this
  // page record; the hardcoded copy below is the WordPress fallback.
  const estimateBlock = page?.layout.find(
    (section): section is Extract<PageSection, { type: 'cta' }> => section.type === 'cta',
  )

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        title={hero?.heading || 'See our blog'}
        description={
          hero?.description ?? (
            <>
              This is where we share our knowledge and insights about everything related to
              remodeling. Whether you&apos;re looking for <strong>advice</strong> on a remodeling
              project, <em>exploring options for your home</em>, or <strong>seeking updates</strong>{' '}
              on the latest trends in the industry, you&apos;ve come to the right place!
            </>
          )
        }
        image={hero?.image}
        imageAlt={page?.title || 'Blog'}
        cta={
          hero?.cta?.label
            ? { label: hero.cta.label, href: hero.cta.href || '/contact' }
            : { label: "Let's discuss your project", href: '/contact' }
        }
      />

      <Section className="bg-white pt-10 ">
        <div className=" grid  gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
      <ServiceEstimateCta
        heading={estimateBlock?.content.heading || 'Ready to schedule your free estimate?'}
        // The CMS body is rich text — the copy carries the contact link and
        // the phone number. The plain string stays as the no-database
        // fallback only.
        body={
          estimateBlock && richTextHasContent(estimateBlock.content.body) ? (
            <RichTextContent data={estimateBlock.content.body} tone="light" />
          ) : undefined
        }
        description={
          richTextHasContent(estimateBlock?.content.body)
            ? undefined
            : 'Contact us here or reach us at (650) 235-4863'
        }
      />
      <ProjectsReviewsSection />
      <LandscapingServiceAreas />
    </div>
  )
}
