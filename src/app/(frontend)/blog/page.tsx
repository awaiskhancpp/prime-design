import type { Metadata } from 'next'

import { BlogPage } from '@/components/blog/BlogPage'

export const metadata: Metadata = {
  title: 'Blog | Prime Design & Build',
  description:
    'Advice, project stories, and remodeling trends from Prime Design & Build in Silicon Valley.',
}

export default function BlogRoute() {
  return <BlogPage />
}
