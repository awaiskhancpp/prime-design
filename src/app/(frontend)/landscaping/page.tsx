import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { LandscapingPage } from '@/components/LandscapingPage'

export async function generateMetadata(): Promise<Metadata> {
  return buildSeoMetadata(
    undefined,
    {
      title: 'Landscaping & Outdoor Living | Prime Design & Build',
      description: 'Thoughtful landscape design and outdoor living spaces across Silicon Valley.',
    },
    { path: '/landscaping' },
  )
}

export default function LandscapingRoute() {
  return <LandscapingPage />
}
