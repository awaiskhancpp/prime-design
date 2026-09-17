import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { ServicesPage } from '@/components/services/ServicesPage'
export const metadata: Metadata = buildSeoMetadata(
  undefined,
  {
    title: 'Services | Home Remodeling by Prime Design & Build - Silicon Valley Experts',
    description:
      'Discover Prime Design & Build’s home remodeling services in Silicon Valley. From kitchen to whole-house renovations, our team delivers exceptional craftsmanship and tailored solutions.',
  },
  { path: '/services' },
)
export default function ServicesRoute() { return <ServicesPage /> }
