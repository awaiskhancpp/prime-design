import { ProjectsReviewsSection } from '@/components/projects/ProjectsReviewsSection'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { resolveBlogPosts } from '@/lib/blog'
import { richTextHasContent, type RichTextValue } from '@/lib/richText'
import { resolveSharedServiceDefaults } from '@/lib/sharedSections'
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
  // The band's own fields win; anything it leaves empty is the shared
  // free-estimate band (Settings → Shared Sections → Service pages), the same
  // one the service pages use.
  const shared = (await resolveSharedServiceDefaults()).estimateBand
  const sharedButton = (Array.isArray(shared?.buttons) ? shared.buttons : [])[0] as
    | { label?: string; url?: string }
    | undefined
  const estimate = {
    heading: estimateBlock?.content.heading || (shared?.heading as string | undefined),
    body: richTextHasContent(estimateBlock?.content.body)
      ? estimateBlock?.content.body
      : (shared?.description as RichTextValue | undefined),
    cta:
      estimateBlock?.content.label && estimateBlock.content.href
        ? { label: estimateBlock.content.label, href: estimateBlock.content.href }
        : sharedButton?.label && sharedButton.url
          ? { label: sharedButton.label, href: sharedButton.url }
          : undefined,
  }

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
      {estimate.heading ? (
        <ServiceEstimateCta
          heading={estimate.heading}
          body={
            richTextHasContent(estimate.body) ? (
              <RichTextContent data={estimate.body} tone="light" />
            ) : undefined
          }
          cta={estimate.cta}
        />
      ) : null}
      <ProjectsReviewsSection />
      <LandscapingServiceAreas />
    </div>
  )
}
