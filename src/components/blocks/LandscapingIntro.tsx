'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

function RevealLine({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.6,
      rootMargin: '-15% 0px -15% 0px',
    })

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function LandscapingIntro() {
  return (
    <section className="relative w-full overflow-hidden bg-ink-2 py-10 md:py-14 text-white ">
      {/* Background Image Container */}
      <div className="absolute inset-y-0 right-0 w-full md:w-3/5 lg:w-1/2">
        <Image
          src="/services/home-remodeling.jpeg"
          alt="Home renovation showcase"
          fill
          className="object-cover object-center"
          // sizes="(min-width: 1024px) 50vw, 100vw"
        />
        {/* Soft horizontal gradient overlay to eliminate the sharp split edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink-2 via-ink-2/60 to-transparent" />
      </div>

      {/* Content Container */}
      <Container className="relative z-10">
        <div className="max-w-xl space-y-6 lg:max-w-2xl">
          <RevealLine>
            <h2 className="font-display text-3xl font-medium leading-tight text-white md:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
              Discover the Prime experience with a new home renovation, ADU, home addition or
              kitchen and bathroom remodel
            </h2>
          </RevealLine>

          <div className="space-y-3 text-base leading-relaxed text-white/80 md:text-lg">
            <RevealLine>
              <p>
                Where we transform blueprints into reality with unwavering dedication and unmatched
                expertise.
              </p>
            </RevealLine>
            <RevealLine>
              <p>
                Your vision is our foundation, and together, we construct a future of enduring
                quality and innovation.
              </p>
            </RevealLine>
            <RevealLine>
              <p>Let&apos;s build something extraordinary.</p>
            </RevealLine>
          </div>
        </div>
      </Container>
    </section>
  )
}
