import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/Badge'
import type { BlogPost } from '@/lib/blog'

export function BlogCard({ post }: { post: BlogPost }) {
  const visibleCategories = post.categories.slice(0, 2)
  const hiddenCount = post.categories.length - visibleCategories.length

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/blog/${post.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-paper-2"
      >
        <Image
          src={post.heroImage}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        {/* Fixed to a single row so every card's heading starts at the same
            height, regardless of how many categories a post has. */}
        <div className="flex items-center gap-2 overflow-hidden">
          {visibleCategories.map((category) => (
            <Badge key={category} className="shrink-0">
              {category}
            </Badge>
          ))}
          {hiddenCount > 0 ? (
            <Badge className="shrink-0 border-line text-ink-2/60">+{hiddenCount}</Badge>
          ) : null}
        </div>

        <h2 className="mt-3 line-clamp-2 font-display text-xl font-medium leading-snug text-ink-2 transition-colors group-hover:text-brass-deep">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-ink-2/70">{post.excerpt}</p>

        <div className="mt-5 flex items-center justify-between gap-4 text-xs text-ink-2/50">
          <span>{post.author}</span>
          <span>{post.date}</span>
        </div>
      </div>
    </article>
  )
}
