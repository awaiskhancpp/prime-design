import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageHero } from '@/components/layout/PageHero'
import { galleryCategories } from '@/lib/gallery'
import { GalleryTabs } from './GalleryTab'
import { Contact } from './Contact'
import { WhyChooseUs } from './WhyChooseUs'

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Our gallery"
        title="A reflection of our remodeling projects in Silicon Valley"
        description="See our kitchens, bathrooms, ADUs, and additions—each shaped around the people who call them home."
        image="/services/kitchen-remodeling.jpeg"
        imageAlt="Remodeled kitchen by Prime Design & Build"
      />

      <main>
        <GalleryTabs categories={galleryCategories} />
      </main>
      <WhyChooseUs />
      <Contact />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
