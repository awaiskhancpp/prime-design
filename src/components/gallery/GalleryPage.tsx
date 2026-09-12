import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { getGalleryCategories } from '@/lib/gallery.server'
import { resolveGallery } from '@/lib/gallery'
import { GalleryTabs } from './GalleryTab'
import { Contact } from './Contact'
import { WhyChooseUs } from './WhyChooseUs'

export async function GalleryPage() {
  // Images come from Payload gallery-categories (WordPress HappyFiles);
  // the page copy comes from the Gallery global.
  const categories = await getGalleryCategories()
  const gallery = await resolveGallery()
  const hero = gallery.hero

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={hero.eyebrow}
        title={<HighlightedText text={hero.heading} highlight={hero.headingHighlight} />}
        description={hero.description ? <RichTextContent data={hero.description} tone="light" /> : undefined}
        image={hero.image}
        imageAlt="Remodeled kitchen by Prime Design & Build"
      />

      <main>
        <GalleryTabs categories={categories} />
      </main>
      <WhyChooseUs
        eyebrow={gallery.whyChooseUs.eyebrow}
        eyebrowAccent={gallery.whyChooseUs.eyebrowAccent}
        heading={gallery.whyChooseUs.heading}
        reasons={gallery.whyChooseUs.reasons}
      />
      <Contact />

      <LandscapingServiceAreas />
    </div>
  )
}
