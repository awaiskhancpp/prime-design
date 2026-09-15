import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { PageExpertsContent as AboutExpertsValue } from '@/lib/pageSections'

const reviewBadges = [
  { src: '/social/Google.png', alt: 'Google rating' },
  { src: '/social/houzz.png', alt: 'Houzz rating' },
  { src: '/social/Yelp.png', alt: 'Yelp rating' },
]

/**
 * CMS-driven Experts section. The WordPress video (Cryer St) plays when
 * set; the WordPress "Company of the Year" badge replaces the built-in
 * review badges when uploaded.
 */
export function ExpertsSection({ experts }: { experts?: AboutExpertsValue }) {
  const eyebrow = experts?.eyebrow
  const heading = experts?.heading ?? ''
  const videoUrl = experts?.video
  const badge = experts?.badge
  const ctaLabel = experts?.ctaLabel
  const ctaHref = experts?.ctaHref

  return (
    <Section className="bg-white">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          {heading}
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col justify-center lg:col-span-5">
          <div className="max-w-xl text-lg leading-8 text-ink-2/75">
            {experts?.description ? <RichTextContent data={experts.description} /> : null}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-line pt-8">
            {badge ? (
              <Image
                src={badge}
                alt="Company of the year award"
                width={120}
                height={120}
                className="h-auto w-auto max-w-28 object-contain"
              />
            ) : (
              reviewBadges.map((item) => (
                <Image
                  key={item.src}
                  src={item.src}
                  alt={item.alt}
                  width={112}
                  height={52}
                  className="h-auto w-auto max-w-28 object-contain"
                />
              ))
            )}
          </div>
          {ctaLabel ? (
            <Button href={ctaHref || '/services'} variant="secondary" className="mt-8 w-fit">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : null}
        </div>

        <div className="lg:col-span-7">
          <div className="overflow-hidden bg-ink">
            <video
              className="aspect-video h-full w-full object-cover"
              controls
              loop
              playsInline
              poster={experts?.poster}
              preload="none"
            >
              {videoUrl ? <source src={videoUrl} type="video/mp4" /> : null}
              Your browser does not support the video tag.
            </video>
          </div>

          {/* What the video says — optional CMS summary + attribution. */}
          {experts?.summary ? (
            <div className="mt-6 border-l-2 border-brass/60 pl-5">
              <div className="text-sm leading-7 text-ink-2/75">
                <RichTextContent data={experts.summary} />
              </div>
              {experts.speakerName ? (
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                  {experts.speakerName}
                  {experts.speakerRole ? ` — ${experts.speakerRole}` : ''}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
