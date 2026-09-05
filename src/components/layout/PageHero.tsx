import Image from 'next/image'
import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

type PageHeroProps = {
  eyebrow: string
  title: string
  description?: string
  image?: string
  backgroundVideo?: string
  imageAlt: string
  align?: 'center' | 'end'
  cta?: { label: string; href: string }
  children?: ReactNode
  showHeader?: boolean
  headerVariant?: 'full' | 'minimal'
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
  backgroundVideo,
  imageAlt,
  align = 'end',
  cta,
  children,
  showHeader = true,
  headerVariant = 'full',
}: PageHeroProps) {
  const isCentered = align === 'center'

  return (
    <section
      className={`relative isolate flex min-h-screen overflow-hidden bg-ink pb-16 pt-32 text-white md:pb-24 md:pt-40 ${isCentered ? 'items-center' : 'items-end'}`}
    >
      {backgroundVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          className="-z-10 absolute inset-0 h-full w-full object-cover opacity-70"
        >
          <source src={backgroundVideo} />
        </video>
      ) : image ? (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          className="-z-10 object-cover opacity-70"
          sizes="100vw"
        />
      ) : null}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink/55 via-ink/25 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

      {showHeader ? <SiteHeader variant={headerVariant} /> : null}

      <Container className="relative z-10 w-full max-w-none">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">{eyebrow}</p>
          <h1 className="mt-1 max-w-4xl font-display text-5xl font-medium leading-tight tracking-tight md:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/85 md:text-lg">
              {description}
            </p>
          ) : null}
          {children}
          {cta ? (
            <Button href={cta.href} variant="primary" size="lg" className="mt-8">
              {cta.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
