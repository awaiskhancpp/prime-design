import type { Metadata } from 'next'

import { TeamPage } from '@/components/team/TeamPage'

export const metadata: Metadata = {
  title: 'Home Remodeling Experts at Prime Design & Build - Silicon Valley',
  description:
    'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley.',
}

export default function TeamRoute() {
  return <TeamPage />
}
