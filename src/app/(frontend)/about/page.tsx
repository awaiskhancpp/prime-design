import type { Metadata } from 'next'

import { AboutPage } from '@/components/about/AboutPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the
// `about` page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('about')
  return buildSeoMetadata(page?.seo, {
    title: 'About Prime Design & Build',
    description: 'Meet the people and principles behind Prime Design & Build in Silicon Valley.',
  })
}

export default function AboutRoute() {
  return <AboutPage />
}
