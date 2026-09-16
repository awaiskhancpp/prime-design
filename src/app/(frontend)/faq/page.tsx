import type { Metadata } from 'next'

import { FaqPage } from '@/components/faq/FaqPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the `faq`
// page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('faq')
  return buildSeoMetadata(page?.seo, {
    title: 'FAQs | Prime Design & Build',
    description:
      'Answers to common questions about remodeling, design, construction, and financing with Prime Design & Build.',
  })
}

export default function FaqRoute() {
  return <FaqPage />
}
