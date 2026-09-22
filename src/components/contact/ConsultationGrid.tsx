'use client'

import Image from '@/components/ui/Image'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'

import type { ConsultationType } from '@/lib/consultations'
import { AppointmentModal } from './AppointmentModal'

function ConsultationCard({
  consultation,
  onBook,
}: {
  consultation: ConsultationType
  onBook: (title: string) => void
}) {
  return (
    <article className="group relative flex flex-col overflow-hidden border border-line bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5">
      {/* Brass top accent — animates in on hover */}
      {/* <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-brass transition-transform duration-300 ease-out group-hover:scale-x-100"
      /> */}

      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image
          src={consultation.image}
          alt={consultation.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        {/* Duration badge */}
        <div className="mb-4 inline-flex items-center gap-1.5 self-start border border-line px-2.5 py-1">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brass" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-brass-deep">
            {consultation.duration}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-xl font-medium leading-snug text-ink">
          {consultation.title}
        </h2>

        {/* Brass rule */}
        <span aria-hidden className="my-5 block h-px w-8 bg-brass" />

        {/* Footer */}
        <div className="mt-auto flex items-center justify-between gap-4">
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-2/40">
            Free · No commitment
          </span>
          <button
            type="button"
            onClick={() => onBook(consultation.title)}
            className="inline-flex shrink-0 items-center gap-2 bg-ink-2 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-ink"
          >
            Book
            <ArrowRight className="h-3 w-3" aria-hidden />
          </button>
        </div>
      </div>
    </article>
  )
}

export function ConsultationGrid({
  consultations,
  phone,
  phoneClean,
}: {
  consultations: ConsultationType[]
  phone?: string
  phoneClean?: string
}) {
  const [selected, setSelected] = useState<string | null>(null)

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {consultations.map((consultation) => (
          <ConsultationCard
            key={consultation.slug}
            consultation={consultation}
            onBook={setSelected}
          />
        ))}
      </div>

      {selected ? (
        <AppointmentModal
          key={selected}
          consultation={selected}
          onClose={() => setSelected(null)}
          phone={phone}
          phoneClean={phoneClean}
        />
      ) : null}
    </>
  )
}
