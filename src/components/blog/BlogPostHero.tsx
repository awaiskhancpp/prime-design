import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import type { BlogPost } from '@/lib/blog'

/**
 * Blog detail hero — follows this site's established full-bleed hero
 * pattern (see LandscapingHero / ServiceHero): background image, dark
 * scrim, content overlaid and bottom-anchored. Kept shorter than the
 * marketing-page heroes (min-h-[70vh] rather than min-h-screen) since this
 * is an article detail page — a full viewport of scroll before the actual
 * post starts would work against reading flow here.
 */
export function BlogPostHero({ post }: { post: BlogPost }) {
  return (
    <section className="relative isolate flex min-h-[70vh] items-end overflow-hidden bg-ink pb-14 pt-28 text-white md:pb-20">
      <Image
        src={post.heroImage}
        alt={post.title}
        fill
        priority
        className="-z-20 object-cover"
        sizes="100vw"
      />
      {/* Heavier at the bottom-left where the text sits, fading out toward
          the top-right — same scrim logic as ServiceHero — so the photo
          still reads clearly in the untouched area. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(20,33,61,0.55)_0%,rgba(20,33,61,0.3)_45%,rgba(20,33,61,0.08)_100%),linear-gradient(0deg,rgba(20,33,61,0.4)_0%,transparent_60%)]" />

      <Container className="relative z-10 w-full">
        <Button href="/blog" variant="line" className="text-white">
          ← Back to blog
        </Button>

        <div className="mt-8 max-w-3xl">
          <div className="flex flex-wrap gap-2">
            {post.categories.map((category) => (
              <span
                key={category}
                className="inline-flex items-center  border border-brass/50 bg-brass/30 px-3 py-1 text-xs font-medium text-white "
              >
                {category}
              </span>
            ))}
          </div>

          <h1 className="font-display text-4xl font-medium leading-tight tracking-tight md:text-6xl">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/20 pt-5 text-sm text-white/75">
            <span className="font-medium text-white">{post.author}</span>
            <span className="h-1 w-1 rounded-full bg-white/40" aria-hidden />
            <span>{post.date}</span>
          </div>
        </div>
      </Container>
    </section>
  )
}
