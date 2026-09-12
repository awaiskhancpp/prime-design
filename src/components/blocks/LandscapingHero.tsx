import { CalendarDays, ArrowRight } from 'lucide-react'

import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { HERO_VIDEO_DESKTOP, HERO_VIDEO_MOBILE } from '@/lib/assets'
import type { HomepageHero } from '@/lib/homepage'

/**
 * The site's one centered hero — reserved for this primary/homepage
 * placement. Every other page hero uses PageHero's left-aligned layout.
 * Content comes from the Homepage global.
 *
 * WordPress serves this hero as two files — a 4K desktop clip and a 3 MB
 * mobile cut — and swaps them on the tablet breakpoint. Payload only holds
 * the mobile cut (media 447), so the desktop clip is served first for wide
 * screens; the CMS video, then the CDN mobile cut, cover the rest.
 */
export function LandscapingHero({ hero }: { hero?: HomepageHero }) {
  const image = hero?.image
  const cta = hero?.cta
  const heading = hero?.heading || 'Top-rated design and build firm in the Bay Area'

  return (
    <PageHero
      align="center"
      eyebrow={hero?.eyebrow}
      title={<HighlightedText text={heading} highlight={hero?.headingHighlight} />}
      description={hero?.description}
      videoSources={[
        { src: HERO_VIDEO_DESKTOP, media: '(min-width: 768px)' },
        // The CMS video is the source of truth; the CDN mobile cut sits last
        // so playback still works if that upload is ever unavailable.
        ...(hero?.video ? [{ src: hero.video }] : []),
        { src: HERO_VIDEO_MOBILE },
      ]}
      videoPoster={image}
      image={image}
      imageAlt="Prime Design & Build home remodeling project"
    >
      {cta?.label ? (
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button href={cta.href || '/contact'} variant="primary">
            <CalendarDays /> {cta.label} <ArrowRight />
          </Button>
        </div>
      ) : null}
    </PageHero>
  )
}
