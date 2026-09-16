import type { Metadata } from 'next'

import { TestimonialsPage } from '@/components/testimonials/TestimonialsPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the
// `testimonials` page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('testimonials')
  return buildSeoMetadata(page?.seo, {
    title: 'Testimonials | Prime Design & Build',
    description:
      'Read reviews from homeowners who worked with Prime Design & Build across Silicon Valley.',
  })
}

export default function TestimonialsRoute() {
  return <TestimonialsPage />
}
