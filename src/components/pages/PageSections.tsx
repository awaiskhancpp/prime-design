import Image from '@/components/ui/Image'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { Section } from '@/components/ui/Section'
import type { PageSection } from '@/lib/pageSections'
import { Button } from '@/components/ui/Button'

import { CustomSection } from '@/components/blocks/CustomSection'
import { LinkList } from '@/components/blocks/LinkList'
import { NextSteps } from '@/components/blocks/NextSteps'
import { PolicySections } from '@/components/blocks/PolicySections'
import { HomeContact } from '@/components/blocks/HomeContact'
import { HomeFeatureBlocks } from '@/components/blocks/HomeFeatureBlocks'
import { HomeProjects } from '@/components/blocks/HomeProjects'
import { HomeServices } from '@/components/blocks/HomeServices'
import { LandscapingDifference } from '@/components/blocks/LandscapingDifference'
import { LandscapingIntro } from '@/components/blocks/LandscapingIntro'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { richTextHasContent } from '@/lib/richText'
import { AboutFaq } from '@/components/about/AboutFaq'
import { CoreValues } from '@/components/about/CoreValues'
import { ExpertsSection } from '@/components/about/ExpertsSection'
import { SocialProofSection } from '@/components/about/SocialProofSection'
import { GuidingPrinciple } from '@/components/about/GuidingPrinciple'
import { TeamSection } from '@/components/about/TeamSection'
import { Contact } from '@/components/gallery/Contact'
import { GalleryTabs } from '@/components/gallery/GalleryTab'
import { WhyChooseUs } from '@/components/gallery/WhyChooseUs'
import { SectionHero } from './SectionHero'
import { FaqExplorer } from '@/components/faq/FaqExplorer'
import { ConsultationGrid } from '@/components/contact/ConsultationGrid'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { TestimonialVideos } from '@/components/testimonials/TestimonialVideos'
import { ReviewHighlights } from '@/components/testimonials/ReviewHighlights'
import { TestimonialsSpotlight } from '@/components/testimonials/TestimonialsSpotlight'

import type { AboutTeamMember } from '@/lib/team'
import type { GalleryCategory } from '@/lib/gallery.server'
import type { Service } from '@/lib/services'
import type { SiteSettingsValue } from '@/lib/siteSettings'
import type { CollectionTestimonial } from '@/lib/testimonialsCollection.server'
import type { FaqIndexCategory } from '@/lib/faqIndex.server'
import type { ConsultationType } from '@/lib/consultations'

/**
 * Everything a section might need that isn't stored on the page itself:
 * services from the services collection, team members, gallery categories,
 * the phone number and the review-profile links.
 */
export type PageSectionContext = {
  /** Google Ads pages keep service-area names and map pins non-navigating. */
  isGoogleAdsPage?: boolean
  services?: Service[]
  members?: AboutTeamMember[]
  galleryCategories?: GalleryCategory[]
  phone?: string
  socialLinks?: SiteSettingsValue['socialLinks']
  /** Video filename -> project URL, for the walkthrough carousel's button. */
  projectHrefByVideo?: Record<string, string>
  /**
   * Testimonials collection records, for the sections that show reviews. They
   * are passed in rather than stored on the page, mirroring the WordPress
   * slider's query loop over the `testimonial` post type.
   */
  testimonials?: CollectionTestimonial[]
  /**
   * FAQs grouped by category, for the FAQ index section. Passed in rather than
   * stored on the page, mirroring the WordPress query loop over the FAQ
   * taxonomy.
   */
  faqCategories?: FaqIndexCategory[]
  /** Consultation types for the contact page's picker. */
  consultations?: ConsultationType[]
  phoneClean?: string
}

/**
 * Renders a page's sections in order. Used by every page route — the
 * homepage, About, Gallery and the generic `[...slug]` pages — so any section
 * can be placed on any page.
 */
export function PageSections({
  sections,
  context = {},
}: {
  sections: PageSection[]
  context?: PageSectionContext
}) {
  return (
    <>
      {sections.map((section, index) => (
        <PageSectionNode key={`${section.type}-${index}`} section={section} context={context} />
      ))}
    </>
  )
}

function PageSectionNode({
  section,
  context,
}: {
  section: PageSection
  context: PageSectionContext
}) {
  switch (section.type) {
    case 'hero':
      return <SectionHero hero={section.content} />

    case 'social-proof':
      return <SocialProofSection content={section.content} socialLinks={context.socialLinks} />

    case 'intro':
      return (
        <LandscapingIntro
          intro={section.content}
          socialLinks={context.socialLinks}
          bodyContent={
            section.content.body ? <RichTextContent data={section.content.body} /> : undefined
          }
        />
      )

    case 'difference':
      return (
        <LandscapingDifference
          difference={section.content}
          projectHrefByVideo={context.projectHrefByVideo}
        />
      )

    case 'projects':
      return (
        <HomeProjects
          eyebrow={section.content.eyebrow}
          heading={section.content.heading}
          headingHighlight={section.content.headingHighlight}
        />
      )

    case 'services': {
      // WordPress features six of the eleven services on the homepage. The
      // "Featured on homepage" checkbox on each service decides which; when
      // none are checked the whole catalogue is shown, matching the same
      // convention the projects grid uses for its `featured` flag.
      const all = context.services ?? []
      const featured = all.filter((service) => service.featured)
      return (
        <HomeServices
          eyebrow={section.content.eyebrow}
          heading={section.content.heading}
          headingHighlight={section.content.headingHighlight}
          services={featured.length ? featured : all}
        />
      )
    }

    case 'feature-blocks':
      return <HomeFeatureBlocks featureBlocks={section.content} />

    case 'contact-intro':
      return <HomeContact contactIntro={section.content} />

    case 'team':
      return (
        <TeamSection
          teamIntro={section.content}
          members={context.members}
          bodyContent={
            section.content.body ? <RichTextContent data={section.content.body} /> : undefined
          }
          introBodyContent={
            section.content.introBody ? (
              <RichTextContent data={section.content.introBody} />
            ) : undefined
          }
        />
      )
    case 'experts':
      return <ExpertsSection experts={section.content} />

    case 'guiding-principle':
      return <GuidingPrinciple guidingPrinciple={section.content} />

    case 'core-values':
      return <CoreValues coreValues={section.content} />

    case 'faq':
      return <AboutFaq phone={context.phone} faqIntro={section.content} />

    case 'gallery-tabs':
      return (
        <GalleryTabs
          categories={context.galleryCategories ?? []}
          heading={section.content.heading}
          description={section.content.description}
        />
      )

    case 'why-choose-us':
      return (
        <WhyChooseUs
          eyebrow={section.content.eyebrow}
          eyebrowAccent={section.content.eyebrowAccent}
          heading={section.content.heading}
          reasons={section.content.reasons}
        />
      )

    case 'contact':
      return <Contact city={section.content.city} poster={section.content.poster} />

    case 'testimonial-videos':
      return <TestimonialVideos content={section.content} />

    case 'review-highlights':
      return (
        <ReviewHighlights content={section.content} testimonials={context.testimonials ?? []} />
      )

    case 'testimonials-spotlight': {
      const reviews = context.testimonials ?? []
      const limit = section.content.reviewLimit
      return (
        <TestimonialsSpotlight
          reviews={limit && limit > 0 ? reviews.slice(0, limit) : reviews}
          eyebrow={section.content.eyebrow}
          heading={section.content.heading}
          body={section.content.body}
          ctaLabel={section.content.ctaLabel}
          ctaHref={section.content.ctaHref}
          ctaNote={section.content.ctaNote}
        />
      )
    }

    case 'consultations':
      return (
        <Section className="bg-white">
          {section.content.heading || section.content.eyebrow ? (
            <div className="mb-10">
              <SectionHeader
                align="center"
                eyebrow={section.content.eyebrow}
                title={section.content.heading ?? ''}
                description={section.content.description}
              />
            </div>
          ) : null}
          <ConsultationGrid
            consultations={context.consultations ?? []}
            assuranceNote={section.content.assuranceNote}
            phone={context.phone}
            phoneClean={context.phoneClean}
          />
        </Section>
      )

    case 'faq-index':
      return <FaqExplorer content={section.content} categories={context.faqCategories ?? []} />

    case 'service-areas':
      return (
        <LandscapingServiceAreas
          heading={section.content.heading}
          linked={!context.isGoogleAdsPage}
        />
      )

    case 'custom':
      return <CustomSection section={section.content} />

    // The generic blocks that predate the sections.
    case 'content':
      return (
        <Section>
          {section.content.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {section.content.eyebrow}
            </p>
          ) : null}
          <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
            {section.content.heading}
          </h2>
          <p className="mt-4 max-w-3xl text-base leading-8 text-ink-2/75">{section.content.body}</p>
        </Section>
      )

    case 'image-text':
      return (
        <Section>
          <div
            className={`grid gap-8 md:grid-cols-2 md:items-center ${
              section.content.imageSide === 'left' ? 'md:[&>div:first-child]:order-2' : ''
            }`}
          >
            <div>
              {section.content.eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                  {section.content.eyebrow}
                </p>
              ) : null}
              <h2 className="mt-3 font-display text-3xl font-semibold text-ink">
                {section.content.heading}
              </h2>
              <p className="mt-4 text-base leading-8 text-ink-2/75">{section.content.body}</p>
            </div>
            {section.content.image ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                <Image
                  src={section.content.image}
                  alt={section.content.heading}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
              </div>
            ) : null}
          </div>
        </Section>
      )

    case 'gallery':
      return (
        <Section>
          {section.content.heading ? (
            <h2 className="mb-6 font-display text-3xl font-semibold text-ink">
              {section.content.heading}
            </h2>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {section.content.images.map((image, imageIndex) => (
              <div
                key={`${image}-${imageIndex}`}
                className="relative aspect-[4/3] overflow-hidden bg-paper-2"
              >
                <Image
                  src={image}
                  alt={`Gallery image ${imageIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </div>
            ))}
          </div>
        </Section>
      )

    case 'cta':
      return (
        <Section className="bg-paper-2">
          <h2 className="font-display text-3xl font-semibold text-ink">
            {section.content.heading}
          </h2>
          {richTextHasContent(section.content.body) ? (
            <div className="mt-4 max-w-2xl text-base leading-8 text-ink-2/75 [&_a]:font-semibold [&_a]:text-brass-deep [&_a]:underline [&_a]:underline-offset-2">
              <RichTextContent data={section.content.body} />
            </div>
          ) : null}
          {section.content.label && section.content.href ? (
            <Button href={section.content.href} className="mt-6">
              {section.content.label}
            </Button>
          ) : null}
        </Section>
      )

    case 'policy':
      return <PolicySections content={section.content} />

    case 'next-steps':
      return <NextSteps content={section.content} />

    case 'link-list':
      return <LinkList content={section.content} />

    default:
      return null
  }
}
