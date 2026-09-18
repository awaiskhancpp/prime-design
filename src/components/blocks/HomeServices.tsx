'use client'

import Image from 'next/image'
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

export function HomeServices({
  heading,
  services = [],
}: {
  heading?: string
  /** Payload services to show (already filtered/ordered by the caller). */
  services?: Service[]
}) {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <Section className="">
      <div className="flex items-end justify-between gap-6">
        <SectionHeader title={heading ?? ''} />
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

      <Swiper
        modules={[Navigation]}
        loop={services.length > 3}
        loopAdditionalSlides={services.length}
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
        {services.map((service, index) => (
          <SwiperSlide key={service.slug}>
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
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  )
}
