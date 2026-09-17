import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'

import { TeamPage } from '@/components/team/TeamPage'

export const metadata: Metadata = buildSeoMetadata(
  undefined,
  {
    title: 'Team | Home Remodeling Experts at Prime Design & Build - Silicon Valley',
    description:
      'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley. Learn about our skilled professionals dedicated to exceptional results.',
  },
  { path: '/team' },
)

export default function TeamRoute() {
  return <TeamPage />
}
