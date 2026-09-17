import type { Metadata } from 'next'

import { GalleryPage } from '@/components/gallery/GalleryPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the
// `gallery` page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('gallery')
  return buildSeoMetadata(page?.seo, {
    title: 'Gallery',
    description:
      'Explore kitchen, bathroom, ADU, and home addition projects by Prime Design & Build in Silicon Valley.',
  }, { path: '/gallery' })
}

export default function GalleryRoute() {
  return <GalleryPage />
}
