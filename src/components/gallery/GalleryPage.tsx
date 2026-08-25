import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { galleryCategories } from '@/lib/gallery'
import { GallerySection } from './GallerySection'
import { Contact } from './Contact'
import { WhyChooseUs } from './WhyChooseUs'

export function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />

      <Section className="bg-white mt-22 text-center md:mt-32">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">Our gallery</p>
        <h1 className="mx-auto mt-4 max-w-4xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          A reflection of our remodeling projects in Silicon Valley
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-ink-2/70">
          See our kitchens, bathrooms, ADUs, and additions—each shaped around the people who call
          them home.
        </p>
      </Section>

      <main>
        {galleryCategories.map((category) => (
          <GallerySection key={category.slug} category={category} />
        ))}
      </main>
      <WhyChooseUs />
      <Contact />

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
