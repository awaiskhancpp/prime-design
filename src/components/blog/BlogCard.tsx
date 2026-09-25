import { PhotoPlateCard } from '@/components/ui/PhotoPlateCard'
import type { BlogPost } from '@/lib/blog'

/**
 * A post on `/blog`.
 *
 * It is `ui/PhotoPlateCard` — the photograph kept whole with a paper plate
 * under it, opened by a brass rule. That treatment used to be the projects
 * grid's, and it moved here because it was never a project idiom: a plate of
 * categories, a headline, a two-line standfirst and a byline is the shape of
 * an article, and reading it on a project made the portfolio look like a blog.
 * The projects grid now has a photographic tile of its own (`ProjectCard`).
 *
 * The card previously drew its own version of the same arrangement — bare
 * copy under the image, category badges, title, excerpt, byline — which is
 * the second implementation §2 of CLAUDE.md warns about. There is one now.
 *
 * `aspect-[4/3]` rather than the plate's 3:2 default: it is the frame the blog
 * grid already used, and the hero images are shot for it.
 *
 * All of a post's categories go in the eyebrow, joined, rather than as badges.
 * The plate's eyebrow is a single brass line — a row of bordered pills sitting
 * on it would be a third treatment of the same information.
 */
export function BlogCard({ post }: { post: BlogPost }) {
  return (
    <PhotoPlateCard
      href={`/blog/${post.slug}`}
      image={post.heroImage}
      imageAlt={post.title}
      aspect="aspect-[4/3]"
      eyebrow={post.categories.join(' · ') || undefined}
      title={post.title}
      footerLeft={[post.author, post.date].filter(Boolean).join(' · ')}
      actionLabel="Read article"
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
    >
      <p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 text-ink-2/70">{post.excerpt}</p>
    </PhotoPlateCard>
  )
}
