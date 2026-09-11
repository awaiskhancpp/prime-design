import Image from 'next/image'
import Link from 'next/link'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { PageHero } from '@/components/layout/PageHero'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Section } from '@/components/ui/Section'
import type { Page } from '@/lib/pages'

export function PayloadPage({ page }: { page: Page }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow={page.hero?.eyebrow || 'Prime Design & Build'}
        title={page.hero?.heading || page.title}
        description={page.hero?.description}
        image={page.hero?.image || '/services/home-remodeling.jpeg'}
        imageAlt={page.title}
        cta={
          page.hero?.cta?.label
            ? { label: page.hero.cta.label, href: page.hero.cta.href || '/contact' }
            : undefined
        }
      />
      <main>
        {page.layout.map((block, index) => {
          if (block.blockType === 'content') {
            return (
              <Section key={`content-${index}`}>
                {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">{block.eyebrow}</p>}
                <h2 className="mt-3 font-display text-3xl font-semibold text-ink">{block.heading}</h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-ink-2/75">{block.body}</p>
              </Section>
            )
          }

          if (block.blockType === 'image-text') {
            return (
              <Section key={`image-text-${index}`}>
                <div className={`grid gap-8 md:grid-cols-2 md:items-center ${block.imageSide === 'left' ? 'md:[&>div:first-child]:order-2' : ''}`}>
                  <div>
                    {block.eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">{block.eyebrow}</p>}
                    <h2 className="mt-3 font-display text-3xl font-semibold text-ink">{block.heading}</h2>
                    <p className="mt-4 text-base leading-8 text-ink-2/75">{block.body}</p>
                  </div>
                  {block.image && <div className="relative aspect-[4/3] overflow-hidden bg-paper-2"><Image src={block.image} alt={block.heading} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" /></div>}
                </div>
              </Section>
            )
          }

          if (block.blockType === 'gallery') {
            return (
              <Section key={`gallery-${index}`}>
                {block.heading && <h2 className="mb-6 font-display text-3xl font-semibold text-ink">{block.heading}</h2>}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {block.images.map((image, imageIndex) => <div key={`${image}-${imageIndex}`} className="relative aspect-[4/3] overflow-hidden bg-paper-2"><Image src={image} alt={`${page.title} image ${imageIndex + 1}`} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" /></div>)}
                </div>
              </Section>
            )
          }

          return (
            <Section key={`cta-${index}`} className="bg-paper-2">
              <h2 className="font-display text-3xl font-semibold text-ink">{block.heading}</h2>
              {block.body && <p className="mt-4 max-w-2xl text-base leading-8 text-ink-2/75">{block.body}</p>}
              {block.label && block.href && <Link href={block.href} className="mt-6 inline-flex bg-brass px-5 py-3 text-sm font-semibold text-white">{block.label}</Link>}
            </Section>
          )
        })}
      </main>
      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
