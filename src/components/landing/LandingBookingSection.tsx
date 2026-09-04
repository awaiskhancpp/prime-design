'use client'

import { useState } from 'react'

import { AppointmentModal } from '@/components/contact/AppointmentModal'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'

export function LandingBookingSection({
  heading = 'Request an Estimate Appointment',
}: {
  heading?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Section className="bg-paper">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          Schedule a consultation
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">{heading}</h2>
        <Button type="button" onClick={() => setOpen(true)} className="mt-7">
          Select a date and time
        </Button>
      </div>
      {open ? <AppointmentModal consultation={heading} onClose={() => setOpen(false)} /> : null}
    </Section>
  )
}
