import type { Metadata } from 'next'

import { ProjectsPage } from '@/components/projects/ProjectsPage'

export const metadata: Metadata = {
  title: 'Our Projects | Prime Design & Build',
  description: 'Explore remodeling and construction projects completed by Prime Design & Build across Silicon Valley.',
}

export default function OurProjectsRoute() {
  return <ProjectsPage />
}
