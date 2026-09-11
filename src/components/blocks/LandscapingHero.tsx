import { CalendarDays, ArrowRight } from 'lucide-react'

import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { HomepageHero } from '@/lib/homepage'
import { localHeroVideo } from '@/lib/homepage'

/**
 * The site's one centered hero — reserved for this primary/homepage
 * placement. Every other page hero uses PageHero's left-aligned layout.
 * Content comes from the Homepage global; the WordPress hero video stays
 * the fallback until a video is uploaded in the CMS.
 */
export function LandscapingHero({ hero }: { hero?: HomepageHero }) {
  const video = hero?.video || localHeroVideo
  const image = hero?.image
  const cta = hero?.cta
  const heading = hero?.heading || 'Top-rated design and build firm in the Bay Area'

  return (
    <PageHero
      align="center"
      eyebrow={hero?.eyebrow}
      title={<HighlightedText text={heading} highlight={hero?.headingHighlight} />}
      description={hero?.description}
      backgroundVideo={video}
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
