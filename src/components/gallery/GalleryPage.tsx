import { PageSections, type PageSectionContext } from '@/components/pages/PageSections'
import { getGalleryCategories } from '@/lib/gallery.server'
import { resolvePageBySlug } from '@/lib/pages'

/**
 * Gallery page. Its sections live in the Pages collection (record `gallery`),
 * so they can be added, reordered and removed from the admin panel like any
 * other page. The tab images come from the gallery-categories collection.
 */
export async function GalleryPage() {
  const page = await resolvePageBySlug('gallery')
  const categories = await getGalleryCategories()

  const context: PageSectionContext = { galleryCategories: categories }

  return (
    <div className="min-h-screen bg-white">
      <PageSections sections={page?.layout ?? []} context={context} />
    </div>
  )
}
