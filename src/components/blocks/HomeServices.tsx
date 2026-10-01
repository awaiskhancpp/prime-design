'use client'

import Image from '@/components/ui/Image'
import Link from 'next/link'
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import type { Service } from '@/lib/services'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

import 'swiper/css'
import 'swiper/css/navigation'

/** The largest `slidesPerView` in the breakpoints below. */
const MAX_SLIDES_PER_VIEW = 3

/**
 * Loop mode needs comfortably more slides than fit on screen at once —
 * strictly more than twice `slidesPerView`, not merely twice.
 *
 * This is what silently broke the carousel: six featured services against
 * `slidesPerView: 3` is exactly twice, so Swiper 14 refused loop mode,
 * logged "The number of slides is not enough for loop mode" to the console
 * and fell back to a finite track. The carousel then dead-ended on the
 * fourth card with the Next button doing nothing, even though `loop` was
 * set and looked correct in the source.
 */
const MIN_SLIDES_FOR_LOOP = MAX_SLIDES_PER_VIEW * 2 + 1

/**
 * Repeat the services until there are enough slides for Swiper to loop.
 *
 * Padding the track is the fix Swiper's own warning recommends ("add more
 * slides (or make duplicates)"). The alternatives were worse: lowering
 * `slidesPerView` changes the layout, and showing all eleven services
 * instead of the six would override the "Featured on homepage" checkboxes,
 * which are a content decision.
 *
 * A repeat is invisible in use — a looping carousel shows the first card
 * again after the last one anyway, which is the whole point.
 */
function padForLoop(services: Service[]): Service[] {
  // One service cannot loop against itself, and zero would spin forever.
  if (services.length < 2 || services.length >= MIN_SLIDES_FOR_LOOP) return services

  const padded: Service[] = []
  while (padded.length < MIN_SLIDES_FOR_LOOP) padded.push(...services)
  return padded
}

/** One service card — the same card in the carousel and in the phone list. */
function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      className="group flex h-full flex-col border border-line transition-colors duration-300 hover:border-brass"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        {/* WordPress gives the homepage cards their own photo,
            different from the service page hero — that is
            `featuredImage`. The hero is the fallback. */}
        <Image
          src={service.cardImage || service.image}
          alt={service.title}
          width={640}
          height={480}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Numbered corner badge — same motif as the "Why choose
            us" cards elsewhere on the site, so this carousel reads
            as part of the same design system rather than a
            one-off template. */}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-medium text-ink-2 transition-colors group-hover:text-brass-deep">
          {service.title}
        </h3>
        {/* `excerpt` is the one-line summary WordPress writes for
            these cards; `shortDescription` is the longer
            services-index paragraph and stands in when it is empty. */}
        <p className="mt-2 flex-1 text-sm leading-7 text-ink-2/70 line-clamp-2">
          {service.excerpt || service.shortDescription || service.description}
        </p>

        <span className="mt-5 inline-flex items-center gap-2 border-t border-line pt-4 text-xs font-semibold uppercase tracking-[0.14em] text-brass-deep">
          View service
          <ArrowRight
            className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )
}

export function HomeServices({
  eyebrow,
  heading,
  headingHighlight,
  services = [],
}: {
  /** The section's kicker, from the `services` block on the homepage record. */
  eyebrow?: string
  heading?: string
  headingHighlight?: string
  /** Payload services to show (already filtered/ordered by the caller). */
  services?: Service[]
}) {
  const swiperRef = useRef<SwiperType | null>(null)
  const slides = padForLoop(services)
  const canLoop = services.length > 1

  return (
    <Section className="">
      <div className="flex items-end justify-between gap-6">
        <SectionHeader eyebrow={eyebrow} title={heading ?? ''} titleHighlight={headingHighlight} />
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/*
        Phones get the stacked list below instead; the arrows above are already
        hidden at this width. The wrapper carries `hidden`, not the Swiper
        itself: swiper's own stylesheet sets `display: block` on `.swiper`
        and overrides a utility class put on it.
      */}
      <div className="hidden sm:block">
        <Swiper
          modules={[Navigation]}
          loop={canLoop}
          loopAdditionalSlides={MAX_SLIDES_PER_VIEW}
          loopPreventsSliding={false}
          onBeforeInit={(swiper) => {
            swiperRef.current = swiper
          }}
          spaceBetween={32}
          slidesPerView={1}
          breakpoints={{
            768: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 3,
            },
          }}
          className="mt-10 [&_.swiper-slide]:h-auto"
        >
          {slides.map((service, index) => (
            // `slides` can repeat a service to reach the loop minimum, so the
            // slug alone is not unique here.
            <SwiperSlide key={`${service.slug}-${index}`}>
              <ServiceCard service={service} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/*
        On a phone the services are a plain list, one card after another: a
        one-card slider there hides every service but the first behind a swipe
        nobody is prompted to make. The list shows the services themselves,
        not the repeats `padForLoop` adds for the carousel. Only one of the
        two is ever displayed, and `display: none` keeps the other's images
        from loading and its links out of the accessibility tree.
      */}
      <ul className="mt-10 grid gap-6 sm:hidden">
        {services.map((service) => (
          <li key={service.slug}>
            <ServiceCard service={service} />
          </li>
        ))}
      </ul>
    </Section>
  )
}
