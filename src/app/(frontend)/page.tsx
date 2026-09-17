import type { Metadata } from 'next'

import { LandscapingPage } from '@/components/LandscapingPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

/**
 * The homepage had no metadata at all: it inherited the layout's generic title
 * and description, emitted no canonical and no social tags, and ignored the
 * `home` page record whose WordPress (Rank Math) title and description were
 * migrated into Payload. This wires that record up.
 */
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('home')
  return buildSeoMetadata(
    page?.seo,
    {
      title: "Prime Design & Build | Silicon Valley's Premier Home Remodeling Experts",
      description:
        'Transform your space with the #1 rated kitchen, bathroom, and home remodeling experts in Silicon Valley - Prime Design & Build. Experience exceptional craftsmanship and design.',
    },
    { path: '/' },
  )
}

export default function HomePage() {
  return <LandscapingPage />
}
