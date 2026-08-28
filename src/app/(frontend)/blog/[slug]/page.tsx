import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { BlogDetailPage } from '@/components/blog/BlogDetailPage'
import { blogPosts, resolveBlogPostBySlug } from '@/lib/blog'

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)
  return {
    title: post?.seo?.metaTitle || (post ? `${post.title} | Prime Design & Build` : 'Blog | Prime Design & Build'),
    description: post?.seo?.metaDescription || post?.excerpt,
    alternates: post?.seo?.canonicalUrl ? { canonical: post.seo.canonicalUrl } : undefined,
    robots: post?.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function BlogDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await resolveBlogPostBySlug(slug)
  if (!post) notFound()
  return <BlogDetailPage post={post} />
}
