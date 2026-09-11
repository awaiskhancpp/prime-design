'use client'

import Image from 'next/image'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type HeroSlide = {
  src: string
  alt: string
  /** Short caption shown over this slide, e.g. a project name. */
  caption?: string
}

/**
 * Exactly-two-image hero variant. Arrows only ever render here — a single
 * image or video has nothing to switch between, so it never gets them.
 */
export function HeroImagePairSlider({ slides }: { slides: [HeroSlide, HeroSlide] }) {
  const [active, setActive] = useState<0 | 1>(0)
  const other: 0 | 1 = active === 0 ? 1 : 0

  return (
    <>
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          className={`-z-10 object-cover transition-opacity duration-700 ${
            index === active ? 'opacity-70' : 'opacity-0'
          }`}
          sizes="100vw"
        />
      ))}

      <button
        type="button"
        aria-label="Show previous image"
        onClick={() => setActive(other)}
        className="absolute inset-y-0 left-0 z-20 flex w-14 items-center justify-center text-white/70 transition-colors hover:text-white md:w-20"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </button>
      <button
        type="button"
        aria-label="Show next image"
        onClick={() => setActive(other)}
        className="absolute inset-y-0 right-0 z-20 flex w-14 items-center justify-center text-white/70 transition-colors hover:text-white md:w-20"
      >
        <ChevronRight className="h-6 w-6" aria-hidden />
      </button>

      {slides[active].caption ? (
        <p className="pointer-events-none absolute bottom-8 right-8 z-10 text-xs font-semibold uppercase tracking-[0.24em] text-white/70 md:bottom-12 md:right-12">
          {slides[active].caption}
        </p>
      ) : null}
    </>
  )
}
