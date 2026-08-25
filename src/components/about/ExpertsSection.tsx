import Image from 'next/image'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'

const reviewBadges = [
  { src: '/social/Google.png', alt: 'Google rating' },
  { src: '/social/houzz.png', alt: 'Houzz rating' },
  { src: '/social/Yelp.png', alt: 'Yelp rating' },
]

export function ExpertsSection() {
  const { experts } = website.about

  return (
    <Section className="bg-white">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{experts.eyebrow}</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          {experts.heading}
        </h2>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="max-w-xl text-lg leading-8 text-ink-2/75">{experts.description}</p>
          <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-line pt-8">
            {reviewBadges.map((badge) => (
              <Image
                key={badge.src}
                src={badge.src}
                alt={badge.alt}
                width={112}
                height={52}
                className="h-auto w-auto max-w-28 object-contain"
              />
            ))}
          </div>
        </div>

        <div className="overflow-hidden bg-ink lg:col-span-7">
          <video
            className="aspect-video h-full w-full object-cover"
            controls
            muted
            loop
            playsInline
            poster={experts.videoPoster}
            preload="metadata"
          >
            <source src={experts.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </Section>
  )
}
