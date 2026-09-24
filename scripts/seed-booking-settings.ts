import 'dotenv/config'

/**
 * Gives the Booking & Availability global its starting values.
 *
 *   npx tsx scripts/seed-booking-settings.ts        # report only
 *   npx tsx scripts/seed-booking-settings.ts write  # apply
 *
 * These replace what `AppointmentModal` hardcoded. The times are the obvious
 * correction to the five it offered — 12am, 1am, 2am, 3am and 10pm — for a
 * contractor whose own published hours are 8am to 6pm, Monday to Friday. The
 * closed weekdays match those hours, and the window is the three months the
 * owner asked for. Everything here is editable in the admin afterwards; this
 * only stops the global being empty.
 */
const write = process.argv[2] === 'write'

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const current = (await payload.findGlobal({
  slug: 'booking-settings',
  depth: 0,
})) as unknown as Record<string, unknown>
const hasSlots = Array.isArray(current.slots) && current.slots.length > 0

if (hasSlots) {
  console.log('Booking settings already configured — leaving them alone.')
  process.exit(0)
}

const data = {
  slots: [
    { time: '09:00 am' },
    { time: '10:30 am' },
    { time: '01:00 pm' },
    { time: '02:30 pm' },
    { time: '04:00 pm' },
  ],
  minNoticeHours: 24,
  // Open Monday to Friday, matching the published "Open: 8am - 6pm (Mon - Fri)".
  closedWeekdays: ['0', '6'],
  dailyCapacity: 3,
  bookingWindowDays: 90,
}

console.log('Would write:', JSON.stringify(data, null, 1))
if (write) {
  await payload.updateGlobal({ slug: 'booking-settings', data: data as never })
  console.log('\nApplied.')
} else {
  console.log('\nRe-run with `write` to apply.')
}
process.exit(0)
