import Image from '@/components/ui/Image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { HeroImagePairSlider, type HeroSlide } from '@/components/layout/HeroImagePairSlider'
import { heroTitleSize } from '@/components/layout/heroTitleSize'
import type { ServiceDetail } from '@/lib/services'

// Real project footage already hosted for the site, used as the full
// background — same idea as the landscaping page's video hero, just
// tied to actual company footage instead of a stock clip.
const AMBIENT_VIDEO_URL = '/api/media/file/ilay-alice-ave-kitchen.mp4'

export function ServiceHero({ service }: { service: ServiceDetail }) {
  const heroVideo = service.heroVideoUrl
  const heroSecondary = service.heroImageSecondary
  const heroTitle = service.heroHeading || service.title
  // Two hero images (and no video) render the pair slider: first image
  // visible, crossfade to the second, prev/next arrows only because there
  // are exactly two. A video still wins over both images.
  const heroPair =
    !heroVideo && service.image && heroSecondary
      ? ([
          { src: service.image, alt: service.heroHeading || service.title },
          { src: heroSecondary, alt: service.heroHeading || service.title },
        ] as [HeroSlide, HeroSlide])
      : undefined

  /**
   * Two hero buttons share one line on a phone, and neither label wraps.
   *
   * That is a tight budget, so it is worth writing down where it comes from.
   * `Container` is `px-4`, and the row's gap is 8px, so each of a pair gets
   * `(viewport - 40) / 2`; take off `px-2` and the borders and the label has
   * `(viewport - 40) / 2 - 18` to live in — 142px on a 360px phone. Measured
   * in the page's own Outfit 600, the longest paired label on the site is
   * the bathroom hero's "Get a Free Consultation" at 137px when set at 10px
   * with `0.02em` tracking. The service heroes' default (12px, `0.1em`,
   * `px-6`) needs 199px for the same label, which is why every one of these
   * pairs wrapped.
   *
   * So below `sm` a paired button drops to `0.02em` tracking, `px-2`, and a
   * size that tracks the viewport — 10px at 360px, rising to the normal 12px
   * by the time there is room for it — and loses the arrow, which costs 26px
   * of a 142px budget and is decorative here. `whitespace-nowrap` guarantees
   * the no-wrap rule even if a future CMS label outgrows the budget.
   *
   * Under 360px the pair stacks instead. At 320px the label has only 122px,
   * and no paired label on the site fits that without going below 10px,
   * which is past readable for a button — stacking is the honest answer
   * there rather than clipping real copy.
   *
   * A lone hero button is unaffected: it has the whole row, so it keeps the
   * full type and its arrow.
   */
  const pairedButtonClasses = [
    'w-full whitespace-nowrap',
    'min-[360px]:w-auto min-[360px]:min-w-0 min-[360px]:flex-1',
    'max-sm:px-2 max-sm:tracking-[0.02em]',
    'max-sm:text-[clamp(0.625rem,2.78vw,0.75rem)]',
    'max-sm:[&>svg]:hidden',
    // The pair keeps sharing the row until `md`, and `lg`'s jump to 14px
    // waits until then too. Released at `sm` instead, the bathroom pair
    // needed 282px + 300px + a 16px gap in the 600px row a 640px screen
    // has, and dropped onto two lines on exactly that width. At 12px in a
    // shared row the widest label and its arrow come to 227px against
    // 258px, which clears comfortably.
    'sm:px-4 sm:text-xs',
    'md:flex-none md:px-8 md:text-sm',
  ].join(' ')

  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--hero-offset,0px))] items-end overflow-hidden bg-ink pb-10 pt-16 text-white lg:pb-16">
      {heroVideo ? (
        <video
          className="absolute inset-0 z-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={service.image}
          aria-hidden="true"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
      ) : heroPair ? (
        <div className="absolute inset-0 z-0">
          <HeroImagePairSlider slides={heroPair} />
        </div>
      ) : (
        <Image
          src={service.image}
          alt=""
          fill
          priority
          className="absolute inset-0 z-0 object-cover"
          sizes="100vw"
        />
      )}

      {/* Same gradient scrim as the landscaping hero — darkest at the
          bottom-left where the text sits, fading out toward the top-right
          so the video still reads clearly. */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(20,33,61,0.55)_0%,rgba(20,33,61,0.3)_45%,rgba(20,33,61,0.12)_100%),linear-gradient(0deg,rgba(20,33,61,0.45)_0%,transparent_65%)]" />

      <Container className="relative z-10 w-full">
        <div className="max-w-4xl">
          {service.eyebrow ? (
            <p className="mb-1 lg:mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-brass">
              {service.eyebrow}
            </p>
          ) : null}
          {/* Wider measure than the copy below: long WordPress headings (e.g.
              the European Kitchen slogan) otherwise wrap to four lines, which
              pushed the whole block up to the middle of the hero. The size
              steps down with the heading's own length for the same reason —
              see `heroTitleSize`. This used to be `text-5xl md:text-7xl`,
              12px larger on a phone than every other hero and with no `sm`
              step at all. */}
          <h1
            className={`max-w-4xl font-display font-medium leading-tight tracking-tight ${heroTitleSize(
              heroTitle.length,
            )}`}
          >
            {heroTitle}
          </h1>
          <p className="mt-1 lg:mt-7 max-w-xl text-base leading-7 text-white/75 md:text-lg">
            {service.lead}
          </p>
          {/* A pair shares one line and never wraps — see
              `pairedButtonClasses` above for the width budget that drives
              it. A lone button takes the whole row. */}
          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3 lg:mt-9">
            {service.heroButtons?.map((button, index, buttons) => (
              <Button
                key={`${button.label}-${button.href}`}
                href={button.href}
                variant="brass"
                size="lg"
                arrow={index === buttons.length - 1}
                className={
                  buttons.length > 1 ? pairedButtonClasses : 'w-full sm:w-auto'
                }
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
