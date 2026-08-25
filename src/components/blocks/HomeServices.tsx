'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useRef } from 'react'
import type { Swiper as SwiperType } from 'swiper'
import { Navigation } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

import 'swiper/css'
import 'swiper/css/navigation'

export function HomeServices() {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <Section className="bg-paper">
      <div className="flex items-end justify-between gap-6">
        <SectionHeader eyebrow="What we do" title="Our services" />
        <div className="hidden shrink-0 items-center gap-3 sm:flex">
          <button
            type="button"
            aria-label="Previous services"
            onClick={() => swiperRef.current?.slidePrev()}
            className="flex h-10 w-10 rounded-full items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next services"
            onClick={() => swiperRef.current?.slideNext()}
            className="flex h-10 w-10 rounded-full[] items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        loop={true}
        onBeforeInit={(swiper) => {
          swiperRef.current = swiper
        }}
        spaceBetween={32}
        slidesPerView={1}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        className="mt-10 [&_.swiper-slide]:h-auto"
      >
        {website.services.map((service) => (
          <SwiperSlide key={service.title}>
            <Link href={service.href} className="group block">
              <div className="aspect-[4/3] overflow-hidden bg-line">
                <Image
                  src={service.image}
                  alt={service.title}
                  width={640}
                  height={480}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-5 border-t border-brass pt-4">
                <h3 className="font-display text-xl font-medium text-ink-2 transition-colors group-hover:text-brass-deep">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-ink-2/70">{service.description}</p>
              </div>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  )
}
