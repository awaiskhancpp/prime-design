import { AppointmentScheduler } from '@/components/contact/AppointmentModal'
import { Section } from '@/components/ui/Section'
import { resolveSiteSettings } from '@/lib/siteSettings'

/**
 * The scheduler band. Most WordPress booking sections are a bare
 * `[latepoint_book_form]` shortcode with no copy of their own, so the
 * heading and eyebrow are optional and have no defaults — the previous
 * default, "Request an Estimate Appointment", was invented copy that
 * appeared on every landing page regardless of its source.
 */
export async function LandingBookingSection({
  eyebrow,
  heading,
  consultationLabel,
  id,
}: {
  eyebrow?: string
  heading?: string
  /** What the scheduler says is being booked; see the block's own note. */
  consultationLabel?: string
  id?: string
}) {
  const settings = await resolveSiteSettings()
  return (
    <Section className="" id={id}>
      {eyebrow || heading ? (
        <div className="mx-auto max-w-3xl text-center">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">
              {heading}
            </h2>
          ) : null}
        </div>
      ) : null}
      <div className={eyebrow || heading ? 'mt-8 flex justify-center' : 'flex justify-center'}>
        <AppointmentScheduler
          consultation={consultationLabel || heading || ''}
          phone={settings.phone}
          phoneClean={settings.phoneClean}
        />
      </div>
    </Section>
  )
}
