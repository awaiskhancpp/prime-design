import { AppointmentScheduler } from '@/components/contact/AppointmentModal'
import { Section } from '@/components/ui/Section'

export function LandingBookingSection({
  heading = 'Request an Estimate Appointment',
}: {
  heading?: string
}) {
  return (
    <Section className="">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          Schedule a consultation
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">{heading}</h2>
      </div>
      <div className="mt-8 flex justify-center">
        <AppointmentScheduler consultation={heading} />
      </div>
    </Section>
  )
}
