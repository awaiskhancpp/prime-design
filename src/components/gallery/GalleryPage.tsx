import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageHero } from '@/components/layout/PageHero'
import { getGalleryCategories } from '@/lib/gallery.server'
import { GalleryTabs } from './GalleryTab'
import { Contact } from './Contact'
import { WhyChooseUs } from './WhyChooseUs'

export async function GalleryPage() {
  // Images come from Payload gallery-categories (WordPress HappyFiles).
  const categories = await getGalleryCategories()

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
        <GalleryTabs categories={categories} />
      </main>
      <WhyChooseUs />
      <Contact />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
