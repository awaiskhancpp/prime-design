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

  // Everything on this page that isn't a post comes from the pages record
  // "blog" (seeded from WordPress page 1670): the hero, and the free-estimate
  // band (WordPress template 1174), stored as that record's `cta` block. An
  // empty field renders nothing — there used to be a typed-out copy of each
  // value here, which made a cleared field look as if it had never been
  // cleared.
  const page = await resolvePageBySlug('blog')
  const hero = page?.hero
  const estimateBlock = page?.layout.find(
    (section): section is Extract<PageSection, { type: 'cta' }> => section.type === 'cta',
  )

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={hero?.eyebrow}
        title={hero?.heading || ''}
        description={hero?.description}
        image={hero?.image}
        imageAlt={page?.title || ''}
        cta={hero?.cta?.label && hero.cta.href ? { label: hero.cta.label, href: hero.cta.href } : undefined}
      />

      <Section className="bg-white pt-10 ">
        <div className=" grid  gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </Section>
      {estimateBlock?.content.heading ? (
        <ServiceEstimateCta
          heading={estimateBlock.content.heading}
          body={
            richTextHasContent(estimateBlock.content.body) ? (
              <RichTextContent data={estimateBlock.content.body} tone="light" />
            ) : undefined
          }
        />
      ) : null}
      <ProjectsReviewsSection />
      <LandscapingServiceAreas />
    </div>
  )
}
