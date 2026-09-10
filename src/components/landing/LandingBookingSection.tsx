import { AppointmentScheduler } from '@/components/contact/AppointmentModal'
import { Section } from '@/components/ui/Section'
import { resolveSiteSettings } from '@/lib/siteSettings'

export async function LandingBookingSection({
  heading = 'Request an Estimate Appointment',
}: {
  heading?: string
}) {
  const settings = await resolveSiteSettings()
  return (
    <Section className="">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
          Schedule a consultation
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">{heading}</h2>
      </div>
      <div className="mt-8 flex justify-center">
        <AppointmentScheduler
          consultation={heading}
          phone={settings.phone}
          phoneClean={settings.phoneClean}
        />
      </div>
    </Section>
  )
}
