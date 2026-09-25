import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'

import { TeamPage } from '@/components/team/TeamPage'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the `team`
// page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('team')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'Team | Home Remodeling Experts at Prime Design & Build - Silicon Valley',
      description:
        'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley. Learn about our skilled professionals dedicated to exceptional results.',
    },
    { path: '/team' },
  )
}

export default function TeamRoute() {
  return <TeamPage />
}
