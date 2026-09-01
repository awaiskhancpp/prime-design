import Link from 'next/link'

import { Contact as ContactForm } from '@/components/gallery/Contact'
import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Section } from '@/components/ui/Section'
import { ServiceContentBlocks } from '@/components/services/ServiceDetailPage'
import type { ServiceDetail } from '@/lib/services'
import type { LandingPage } from '@/lib/landingPages'

// Deliberately no SiteHeader — these are Google Ads destination pages, and
// removing on-page navigation is standard CRO practice for paid traffic
// (fewer exit paths off the page before someone converts). This also
// matches the existing PayloadPage renderer, which already omits it.
export function LandingPageRenderer({ page }: { page: LandingPage }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={page.hero?.eyebrow || 'Prime Design & Build'}
        title={page.hero?.heading || page.title}
        description={page.hero?.lead}
        image={page.hero?.image || '/services/home-remodeling.jpeg'}
        imageAlt={page.title}
      />

      <main>
        {page.sections.length > 0 ? (
          <Section>
            <ServiceContentBlocks
              service={{
                title: page.title,
                slug: page.slug,
                description: page.hero?.lead || '',
                image: page.hero?.image || '/services/home-remodeling.jpeg',
                eyebrow: page.hero?.eyebrow || '',
                lead: page.hero?.lead || '',
                keyFeatures: [],
                benefits: [],
                process: [],
                gallery: [],
              } as ServiceDetail}
              blocks={page.sections}
            />
          </Section>
        ) : null}

        {page.cta?.showForm !== false ? (
          <ContactForm />
        ) : page.cta?.link ? (
          <Section className="bg-paper-2 text-center">
            <Link
              href={page.cta.link}
              className="inline-flex bg-brass px-6 py-3 text-sm font-semibold text-white"
            >
              {page.cta.text || 'Get Your Free Estimate'}
            </Link>
          </Section>
        ) : null}
      </main>

      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
