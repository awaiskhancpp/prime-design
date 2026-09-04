import Image from 'next/image'
import Link from 'next/link'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Badge } from '@/components/ui/Badge'
import { Section } from '@/components/ui/Section'
import type { BlogPost } from '@/lib/blog'

export function BlogDetailPage({ post }: { post: BlogPost }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />
      <main className="pt-20 md:pt-28">
        <Section className="pb-12 md:pb-16">
          <div className="mx-auto max-w-5xl">
            <Link
              href="/blog"
              className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep hover:text-brass"
            >
              ← Back to blog
            </Link>
            <div className="mt-7 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-16">
              <div>
                <div className="flex flex-wrap gap-2">
                  {post.categories.map((category) => (
                    <Badge key={category}>{category}</Badge>
                  ))}
                </div>
                <h1 className="mt-5 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-6xl">
                  {post.title}
                </h1>
                <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2/60">
                  <span>{post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
              <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                <Image
                  src={post.heroImage}
                  alt={post.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 55vw, 100vw"
                />
              </div>
            </div>
          </div>
        </Section>

        <Section className=" py-14 md:py-20">
          <article className="mx-auto max-w-3xl">
            {post.intro && (
              <p className="text-lg leading-8 text-ink-2/80 md:text-xl md:leading-9">
                {post.intro}
              </p>
            )}
            <div className="mt-10 grid gap-16 md:mt-14 md:gap-24">
              {post.sections?.map((section) => (
                <section key={section.heading} className="grid gap-7">
                  <div>
                    {section.eyebrow && (
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brass-deep">
                        {section.eyebrow}
                      </p>
                    )}
                    <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink md:text-4xl">
                      {section.heading}
                    </h2>
                  </div>
                  <p className="text-base leading-8 text-ink-2/75 md:text-lg">{section.body}</p>
                  {section.image && (
                    <div
                      className={`relative overflow-hidden bg-paper-2 ${section.imagePosition === 'center' ? 'mx-auto w-full max-w-2xl' : 'w-full md:w-4/5'} ${section.imagePosition === 'right' ? 'md:ml-auto' : ''}`}
                    >
                      <Image
                        src={section.image}
                        alt={section.imageAlt || section.heading}
                        width={1200}
                        height={800}
                        className="h-auto w-full object-cover"
                        sizes="(min-width: 768px) 720px, 100vw"
                      />
                    </div>
                  )}
                </section>
              ))}
            </div>
            <div className="mt-16 border-t border-line pt-8 text-center md:mt-24">
              <p className="font-display text-2xl text-ink">
                Transform your space with Prime Design &amp; Build.
              </p>
              <Link
                href="/contact"
                className="mt-5 inline-flex text-sm font-semibold text-brass-deep hover:text-brass"
              >
                Start your project →
              </Link>
            </div>
          </article>
        </Section>
      </main>
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
