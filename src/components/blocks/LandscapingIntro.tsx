'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'

import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
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
    <div ref={ref} className={cn('', visible ? '' : '', className)}>
      {children}
    </div>
  )
}

export function LandscapingIntro() {
  return (
    <Section className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <RevealLine>
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl lg:text-[2.5rem] lg:leading-[3rem]">
              Discover the Prime experience with a new home renovation, ADU, home addition or
              kitchen and bathroom remodel
            </h2>
          </RevealLine>

          <div className="mt-6 space-y-3 text-base leading-relaxed text-ink-2/70 md:text-lg">
            <p>
              Where we transform blueprints into reality with unwavering dedication and unmatched
              expertise. Your vision is our foundation, and together, we construct a future of
              enduring quality and innovation. Let&apos;s build something extraordinary.
            </p>
          </div>
        </div>

        <RevealLine>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/services/home-remodeling.jpeg"
              alt="A recently completed Prime Design & Build home renovation"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        </RevealLine>
      </div>
    </Section>
  )
}
