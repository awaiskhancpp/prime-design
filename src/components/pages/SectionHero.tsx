import { ArrowRight, CalendarDays } from 'lucide-react'

import { PageHero } from '@/components/layout/PageHero'
import type { HeroSlide } from '@/components/layout/HeroImagePairSlider'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageHeroContent } from '@/lib/pageSections'

/**
 * The page hero. One component covers every hero on the site: `align` picks
 * the centered primary layout or the left-aligned inner-page one, a video
 * (with an optional higher-quality desktop URL) replaces the image, and two
 * images render the pair slider.
 */
export function SectionHero({ hero }: { hero: PageHeroContent }) {
  const videoSources = hero.videoUrl
    ? [
        { src: hero.videoUrl, media: '(min-width: 768px)' },
        ...(hero.video ? [{ src: hero.video }] : []),
      ]
    : hero.video
      ? [{ src: hero.video }]
      : undefined

  const hasVideo = Boolean(hero.video || hero.videoUrl)
  const pairSlider: [HeroSlide, HeroSlide] | undefined =
    !hasVideo && hero.image && hero.imageSecondary
      ? [
          { src: hero.image, alt: hero.heading || 'Prime Design & Build' },
          { src: hero.imageSecondary, alt: hero.heading || 'Prime Design & Build' },
        ]
      : undefined

  const cta = hero.cta

  return (
    <PageHero
      align={hero.align}
      eyebrow={hero.eyebrow}
      title={<HighlightedText text={hero.heading} highlight={hero.headingHighlight} />}
      description={
        hero.description ? <RichTextContent data={hero.description} tone="light" /> : undefined
      }
      image={pairSlider || hasVideo ? undefined : hero.image}
      images={pairSlider}
      videoSources={videoSources}
      videoPoster={hasVideo ? hero.image : undefined}
      imageAlt={hero.heading || 'Prime Design & Build'}
    >
      {cta ? (
        <div className={hero.align === 'center' ? 'mt-6 flex flex-wrap justify-center gap-2' : ''}>
          <Button
            href={cta.href}
            variant={cta.style === 'outlined' ? 'outline' : 'primary'}
            className={cta.style === 'outlined' ? 'mt-8 text-white' : undefined}
          >
            {cta.showCalendarIcon ? <CalendarDays /> : null} {cta.label} <ArrowRight />
          </Button>
        </div>
      ) : null}
    </PageHero>
  )
}
