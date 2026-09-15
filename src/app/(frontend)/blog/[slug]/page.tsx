import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogDetailPage } from '@/components/blog/BlogDetailPage'
import { blogPosts, resolveBlogPostBySlug } from '@/lib/blog'
import { buildSeoMetadata } from '@/lib/seo'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)
  if (!post) return { title: 'Blog | Prime Design & Build' }

  // Same metadata builder as every other route, so the migrated SEO fields
  // (title, description, canonical, no-index, social tags) are all emitted.
  return buildSeoMetadata(post.seo, {
    title: post.title,
    description: post.excerpt,
  })
}

export default async function BlogDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)
  if (!post) notFound()
  return <BlogDetailPage post={post} />
}
