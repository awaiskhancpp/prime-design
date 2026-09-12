import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { AboutHero as AboutHeroValue } from '@/lib/about'

/**
 * CMS-driven About hero (About global). Video replaces the image(s) when
 * set; two images render the pair slider. The WordPress background image
 * (Kitchen-And-Bathroom-Images-1920-×-1080-px-2.png) is the seeded image.
 */
export function AboutHero({ hero }: { hero?: AboutHeroValue }) {
  const image = hero?.image
  const imageSecondary = hero?.imageSecondary
  const video = hero?.video
  const cta = hero?.cta

  return (
    <PageHero
      align="left"
      eyebrow={hero?.eyebrow}
      title={
        <HighlightedText
          text={hero?.heading || 'The Go-To Choice for Homeowners In Silicon Valley'}
          highlight={hero?.headingHighlight}
        />
      }
      description={
        hero?.description ? (
          <RichTextContent data={hero.description} tone="light" />
        ) : (
          "Our team of visionary leaders and dedicated professionals are committed to transforming your dreams into reality. With years of experience and a shared passion for excellence, we are here to deliver unparalleled service and create stunning spaces that exceed your expectations."
        )
      }
      backgroundVideo={video}
      videoPoster={video ? image : undefined}
      image={!video ? image : undefined}
      images={
        !video && image && imageSecondary
          ? [
              { src: image, alt: 'Prime Design & Build' },
              { src: imageSecondary, alt: 'Prime Design & Build' },
            ]
          : undefined
      }
      imageAlt="A finished Prime Design & Build home remodeling project"
    >
      {cta?.label ? (
        <div className=" ">
          <Button href={cta.href || '/contact'} variant="outline" className="mt-8 text-white">
            {cta.label}
          </Button>
        </div>
      ) : null}
    </PageHero>
  )
}
