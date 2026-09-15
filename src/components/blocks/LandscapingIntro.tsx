'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import type { PageIntroContent } from '@/lib/pageSections'
import { cn } from '@/lib/utils'

function RevealLine({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Reveal once and stay revealed. The previous version re-hid content
    // whenever it left the viewport, and used a 0.6 threshold that a tall
    // element can never satisfy — so content could stay stuck invisible.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setVisible(true)
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out motion-reduce:transition-none',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

/**
 * CMS-driven intro (Homepage global). The rich-text body is rendered by the
 * server (RichTextContent) and passed in as `bodyContent` because this
 * component stays client-side for the reveal animation.
 *
 * Design note: this sits directly beneath the full-bleed photo hero, so the
 * image here is deliberately *contained* — a second edge-to-edge photo reads
 * as one broken collage rather than two sections. Separation instead comes
 * from a tonal step (warm `paper` against the hero's dark and the white
 * sections that follow), an asymmetric 5/7 grid, and layered depth behind
 * the photo.
 */
export function LandscapingIntro({
  intro,
  bodyContent,
}: {
  intro?: PageIntroContent
  bodyContent?: ReactNode
}) {
  const heading = intro?.heading ?? ''
  const image = intro?.image

  return (
    <section className="relative overflow-hidden py-20 md:py-28">
      {/* Brass dot grid — the same motif the original site uses as a
          decorative accent. Desktop only: on mobile everything stacks and it
          would sit behind the copy. */}
      <svg
        className="pointer-events-none absolute -left-16 bottom-0 hidden h-72 w-72 text-brass/25 lg:block"
        aria-hidden
      >
        <pattern id="intro-dot-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="2" fill="currentColor" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#intro-dot-grid)" />
      </svg>

      <Container className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
          <div className={cn(image ? 'lg:col-span-5' : 'lg:col-span-8')}>
            <span className="block h-1 w-16 bg-brass" aria-hidden />
            <h2 className="mt-6 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
              {heading}
            </h2>

            <div className="mt-6">
              <div className="space-y-4 text-base leading-relaxed text-ink-2/75 md:text-lg">
                {bodyContent}
              </div>
            </div>
          </div>

          {image ? (
            <div className="lg:col-span-7">
              <div className="relative">
                {/* Offset layer behind the photo: adds depth and a brass
                    accent without putting a frame/border on the image. */}

                <div className="relative aspect-[4/3] overflow-hidden shadow-2xl shadow-ink/20">
                  <Image
                    src={image}
                    alt={intro?.heading || 'Prime Design & Build project'}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 58vw, 100vw"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
