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
   * Exactly two images to switch between, with prev/next arrows.
   */
  images?: [HeroSlide, HeroSlide]

  imageAlt: string

  /**
   * `center` is reserved for the site's primary hero.
   * Every other page hero uses `left`.
   * `end` is kept as the same layout under its original name.
   */
  align?: 'center' | 'left' | 'end'

  cta?: {
    label: string
    href: string
  }

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
  showHeader = false,
  headerVariant = 'full',
}: PageHeroProps) {
  const isCentered = align === 'center'

  return (
    <section
      className={[
        'relative isolate flex min-h-screen overflow-hidden bg-ink text-white',

        // Vertical alignment: the primary (`center`) hero is actually
        // vertically centered on every screen size, including mobile —
        // it was previously always `items-end`, which pinned the centered
        // variant to the bottom of the viewport on small screens instead
        // of centering it. Every other hero (`left`/`end`) keeps the
        // original bottom-aligned look.
        isCentered ? 'items-center' : 'items-end',

        // Mobile
        'px-0',
        'pb-12',
        'pt-[180px]',

        // Small tablets
        'sm:pb-16',
        'sm:pt-[190px]',

        // Desktop
        'md:pb-24',
        'md:pt-40',
        'lg:pb-28',
      ].join(' ')}
    >
      {/* =========================================================
          BACKGROUND MEDIA
          ========================================================= */}

      {backgroundVideo ? (
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={videoPoster}
          aria-hidden="true"
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-70"
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

      {/* =========================================================
          OVERLAYS
          ========================================================= */}

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-ink/55 via-ink/20 to-transparent" />

      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-ink/45 via-transparent to-ink/10" />

      {/* =========================================================
          OPTIONAL HEADER
          ========================================================= */}

      {showHeader ? <SiteHeader variant={headerVariant} tone="dark" /> : null}

      {/* =========================================================
          HERO CONTENT
          ========================================================= */}

      <Container className="relative z-10 w-full max-w-none">
        <div className={isCentered ? 'mx-auto max-w-5xl text-center' : 'max-w-5xl'}>
          {/* Eyebrow */}
          {eyebrow ? (
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-brass sm:text-xs sm:tracking-[0.24em] md:mb-5">
              {eyebrow}
            </p>
          ) : null}

          {/* Title */}
          <h1
            className={[
              'font-display font-medium leading-[1.05] tracking-tight',

              // Mobile
              'text-4xl',

              // Small tablet
              'sm:text-5xl',

              // Tablet / desktop
              'md:text-7xl',

              isCentered ? 'mx-auto max-w-5xl' : 'max-w-4xl',
            ].join(' ')}
          >
            {title}
          </h1>

          {/* Description */}
          {description ? (
            <div
              className={[
                'mt-4 text-sm leading-6 text-white/85',
                'sm:text-base sm:leading-7',
                'md:mt-5 md:text-lg',

                isCentered ? 'mx-auto max-w-2xl' : 'max-w-3xl',
              ].join(' ')}
            >
              {description}
            </div>
          ) : null}

          {/* Additional content */}
          {children}

          {/* CTA */}
          {cta ? (
            <Button href={cta.href} variant="primary" size="lg" className="mt-5 sm:mt-6 md:mt-8">
              {cta.label}
            </Button>
          ) : null}
        </div>
      </Container>
    </section>
  )
}
