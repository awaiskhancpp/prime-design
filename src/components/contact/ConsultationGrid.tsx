'use client'

import Image from 'next/image'
import { useState } from 'react'

import type { ConsultationType } from '@/lib/consultations'
import { AppointmentModal } from './AppointmentModal'

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
          <article
            key={consultation.slug}
            className="group overflow-hidden border border-brass/50 bg-white"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
              <Image
                src={consultation.image}
                alt={consultation.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              />
            </div>
            <div className="flex min-h-56 flex-col items-center  py-8 text-center">
              <h2 className="font-display text-2xl font-semibold leading-tight text-ink">
                {consultation.title}
              </h2>
              <div className="mt-5 h-px w-20 bg-brass" />
              <p className="mt-5 text-sm font-semibold text-ink-2">Time: {consultation.duration}</p>
              <button
                type="button"
                onClick={() => setSelected(consultation.title)}
                className="mt-auto bg-black px-7 py-4 text-sm font-medium text-white transition-colors hover:bg-ink-2"
              >
                Book Appointment
              </button>
            </div>
          </article>
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
