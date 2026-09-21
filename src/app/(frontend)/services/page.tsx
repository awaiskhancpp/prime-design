import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'
import { ServicesPage } from '@/components/services/ServicesPage'

// CMS-driven SEO: the `services` pages-collection record wins when one
// exists; the previous hardcoded strings remain the fallback (see the same
// pattern on `/our-projects/page.tsx`, `/contact/page.tsx`, etc.).
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('services')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'Services | Home Remodeling by Prime Design & Build - Silicon Valley Experts',
      description:
        'Discover Prime Design & Build’s home remodeling services in Silicon Valley. From kitchen to whole-house renovations, our team delivers exceptional craftsmanship and tailored solutions.',
    },
    { path: '/services' },
  )
}

export default function ServicesRoute() { return <ServicesPage /> }
