'use client'

import type { ReactNode } from 'react'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import type { PageIntroContent } from '@/lib/pageSections'

export function LandscapingIntro({
  intro,
  bodyContent,
}: {
  intro?: PageIntroContent
  bodyContent?: ReactNode
}) {
  const heading = intro?.heading ?? ''
  const image = intro?.image

  const stats = [
    { num: '350', suffix: '+', label: 'Projects Completed' },
    { num: '15', suffix: '+', label: 'Years in Silicon Valley' },
    { num: '4.9', suffix: '★', label: 'Google Rating' },
    { num: '98', suffix: '%', label: 'Client Satisfaction' },
  ]

  return (
    <section className=" py-20 md:py-28">
      <Container>
        {/* Stat strip — anchors the transition from the dark hero above */}
        <div className="mb-16 flex border border-line">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-1 flex-col items-center justify-center border-r border-line py-5 text-center last:border-r-0"
            >
              <span className="font-display text-3xl font-medium leading-none text-ink-2">
                {stat.num}
                <span className="text-xl text-brass">{stat.suffix}</span>
              </span>
              <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2/40">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {intro?.eyebrow ?? "Silicon Valley's Design-Build Team"}
            </p>
            <span aria-hidden className="mt-4 block h-0.5 w-10 bg-brass" />
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
              {heading}
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-2/70">
              {bodyContent}
            </div>
          </div>

          {/* Single image with brass offset frame */}
          {image ? (
            <div className="relative">
              {/* Brass accent block — sits behind and offset top-left,
                  creates depth without a second image or background */}

              <div className="relative aspect-[4/3] w-full overflow-hidden shadow-2xl shadow-ink/15">
                <Image
                  src={image}
                  alt={intro?.heading || 'Prime Design & Build project'}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
