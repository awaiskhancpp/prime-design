import type { Metadata } from 'next'

import { buildSeoMetadata } from '@/lib/seo'
import { resolvePageBySlug } from '@/lib/pages'

import { BlogPage } from '@/components/blog/BlogPage'

export async function generateMetadata(): Promise<Metadata> {
  const page = await resolvePageBySlug('blog')
  return buildSeoMetadata(
    page?.seo,
    {
      title: 'Blog | Prime Design & Build',
      description:
        'Explore our blog for expert insights and tips on remodeling. From project advice to the latest industry trends, find everything you need to transform your home.',
    },
    { path: '/blog' },
  )
}

export default function BlogRoute() {
  return <BlogPage />
}
