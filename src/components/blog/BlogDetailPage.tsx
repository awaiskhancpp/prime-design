import Image from 'next/image'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { BlogPostHero } from './BlogPostHero'
import { richTextHasContent } from '@/lib/richText'
import type { BlogPost } from '@/lib/blog'
import { Contact } from '../gallery/Contact'

export function BlogDetailPage({ post }: { post: BlogPost }) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="dark" />
      <BlogPostHero post={post} />
      <main className="">
        <Section className=" py-14 md:py-20">
          <article className="mx-auto max-w-5xl">
            {typeof post.intro === 'string' ? (
              // Static fallback posts keep a plain-string intro.
              post.intro ? (
                <p className="text-lg leading-8 text-ink-2/80 md:text-xl md:leading-9">
                  {post.intro}
                </p>
              ) : null
            ) : // Payload posts: rich text intro, same editor as the body.
            richTextHasContent(post.intro) ? (
              <RichTextContent data={post.intro} tone="lead" />
            ) : null}
            {post.content ? (
              // Free-form rich text (migrated WordPress posts).
              <div className="mt-10 md:mt-14">
                <RichTextContent data={post.content} />
              </div>
            ) : (
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
            )}
          </article>
        </Section>
      </main>
      <Contact />
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
