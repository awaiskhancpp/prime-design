import type { Metadata } from 'next'

import { ProjectsPage } from '@/components/projects/ProjectsPage'
import { resolvePageBySlug } from '@/lib/pages'
import { buildSeoMetadata } from '@/lib/seo'

// CMS-driven SEO: the migrated WordPress (Rank Math) metadata for the
// `our-projects` page wins; the previous hardcoded strings remain the fallback.
export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('our-projects')
  return buildSeoMetadata(page?.seo, {
    title: 'Our Projects',
    description:
      'Explore remodeling and construction projects completed by Prime Design & Build across Silicon Valley.',
  }, { path: '/our-projects' })
}

export default function OurProjectsRoute() {
  return <ProjectsPage />
}
