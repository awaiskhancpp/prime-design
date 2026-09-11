import Image from 'next/image'
import type { ReactNode } from 'react'

import { SiteHeader } from '@/components/layout/SiteHeader'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { HeroImagePairSlider, type HeroSlide } from './HeroImagePairSlider'

type PageHeroProps = {
  eyebrow?: string
  /** Plain text or inline elements (highlighted words render as spans). */
  title: ReactNode
  /** Plain text or inline elements (migrated WordPress copy keeps <strong>/<em>). */
  description?: ReactNode
  /** Single background image. Ignored if `images` or `backgroundVideo` is set. */
  image?: string
  /** Single background video. Takes priority over `image` and `images`. */
  backgroundVideo?: string
  /** Poster frame shown before the video loads. */
  videoPoster?: string
  /**
   * Exactly two images to switch between, with prev/next arrows. This is the
   * only case that gets arrows — a single image or video has nothing to
   * switch to, so it never shows them.
   */
  images?: [HeroSlide, HeroSlide]
  imageAlt: string
  /**
   * `center` is reserved for the site's primary hero (one per site — the
   * homepage/landscaping hero). Every other page hero uses `left`.
   * `end` is kept as the same layout under its original name so existing
   * call sites don't need to change.
   */
  align?: 'center' | 'left' | 'end'
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
  videoPoster,
  images,
  imageAlt,
  align = 'left',
  cta,
  children,
  // The shared layout chrome renders the site header now; opt back in here
  // only for pages outside that chrome (e.g. Google Ads landing pages).
  showHeader = false,
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
          preload="metadata"
          poster={videoPoster}
          aria-hidden="true"
          className="-z-10 absolute inset-0 h-full w-full object-cover opacity-70"
        >
          <source src={backgroundVideo} type="video/mp4" />
        </video>
      ) : images ? (
        <HeroImagePairSlider slides={images} />
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
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink/35 via-ink/15 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/25 via-transparent to-transparent" />

      {showHeader ? <SiteHeader variant={headerVariant} /> : null}

      <Container className="relative z-10 w-full max-w-none">
        <div className={isCentered ? 'mx-auto max-w-5xl text-center' : 'max-w-5xl'}>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`font-display text-5xl font-medium leading-tight tracking-tight md:text-7xl ${isCentered ? 'mx-auto max-w-5xl' : 'max-w-4xl'}`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={`mt-5 text-base leading-7 text-white/85 md:text-lg ${isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl'}`}
            >
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
