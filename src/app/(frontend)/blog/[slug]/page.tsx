import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogDetailPage } from '@/components/blog/BlogDetailPage'
import { blogPosts, getBlogPostBySlug } from '@/lib/blog'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  return { title: post ? `${post.title} | Prime Design & Build` : 'Blog | Prime Design & Build', description: post?.excerpt }
}

export default async function BlogDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
  if (!post) notFound()
  return <BlogDetailPage post={post} />
}
