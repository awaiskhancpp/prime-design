import type { GlobalConfig } from 'payload'

/**
 * When the company can be booked, and how often.
 *
 * A Global rather than a Collection because there is one booking calendar for
 * the business — the same rule CLAUDE.md §7 states for the homepage and that
 * `SiteSettings` already follows.
 *
 * Everything here used to be hardcoded in `AppointmentModal`, and most of it
 * was not real: the five daily slots were "12:00 am, 01:00 am, 02:00 am,
 * 03:00 am, 10:00 pm", Sunday was the only closed day, the "3 left" badges
 * came from a seeded pseudo-random generator, and the calendar ran forward
 * forever. Nothing was enforced anywhere, because availability was computed
 * in the browser and the server never looked at it.
 *
 * These values are now the single source of truth for both halves: the
 * calendar renders from them, and `/api/contact` re-checks a booking against
 * them before storing it. A visitor who edits the page, replays a request or
 * guesses a date cannot book outside them — see `lib/bookingAvailability.ts`.
 */
export const BookingSettings: GlobalConfig = {
  slug: 'booking-settings',
  label: 'Booking & Availability',
  admin: {
    group: 'Leads',
    description:
      'Which days and times consultations can be booked, how many per day, and how far ahead the calendar runs.',
  },
  access: {
    // The calendar is public, so the settings behind it have to be readable.
    // Only the admin can change them.
    read: () => true,
    update: ({ req: { user } }) => Boolean(user),
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hours',
          description: 'The times offered on an open day, in the order they appear.',
          fields: [
            {
              name: 'slots',
              type: 'array',
              label: 'Appointment times',
              labels: { singular: 'Time', plural: 'Times' },
              admin: {
                description:
                  'Each open day offers these times. Use the 12-hour form the site prints, e.g. “09:00 am”, “01:30 pm”. Remove a row to stop offering that time.',
              },
              fields: [
                {
                  name: 'time',
                  type: 'text',
                  required: true,
                  admin: { placeholder: '09:00 am' },
                },
              ],
            },
            {
              name: 'minNoticeHours',
              type: 'number',
              label: 'Minimum notice (hours)',
              defaultValue: 24,
              min: 0,
              max: 24 * 30,
              admin: {
                description:
                  'How far in advance a visitor must book. At 24, a time less than a day away is not offered — which is also what stops someone booking a slot that has already passed today.',
              },
            },
          ],
        },
        {
          label: 'Closed days',
          description: 'Days nobody can book. Weekdays repeat; dates are one-offs.',
          fields: [
            {
              name: 'closedWeekdays',
              type: 'select',
              hasMany: true,
              label: 'Closed every',
              defaultValue: ['0'],
              options: [
                { label: 'Sunday', value: '0' },
                { label: 'Monday', value: '1' },
                { label: 'Tuesday', value: '2' },
                { label: 'Wednesday', value: '3' },
                { label: 'Thursday', value: '4' },
                { label: 'Friday', value: '5' },
                { label: 'Saturday', value: '6' },
              ],
              admin: {
                description:
                  'Sunday was the only closed day and it was written into the code. Tick any weekday here — a holiday week is easier to handle as individual dates below.',
              },
            },
            {
              name: 'closedDates',
              type: 'array',
              label: 'Closed dates',
              labels: { singular: 'Closed date', plural: 'Closed dates' },
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
                },
                {
                  name: 'note',
                  type: 'text',
                  admin: { description: 'For your own reference, e.g. “Thanksgiving”. Not shown on the site.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Capacity',
          description: 'How many consultations can be booked on one day.',
          fields: [
            {
              name: 'dailyCapacity',
              type: 'number',
              label: 'Appointments per day',
              defaultValue: 3,
              min: 1,
              max: 50,
              admin: {
                description:
                  'The most that can be booked on any open day. Once a day reaches it the calendar shows it as full, and the server refuses a booking for it even if the page is edited to offer one.',
              },
            },
            {
              name: 'dateCapacities',
              type: 'array',
              label: 'Capacity for a specific date',
              labels: { singular: 'Date', plural: 'Dates' },
              admin: {
                description:
                  'Overrides the number above for one date — "only one that day", or two. Set 0 to close the date instead.',
              },
              fields: [
                {
                  name: 'date',
                  type: 'date',
                  required: true,
                  admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd MMM yyyy' } },
                },
                {
                  name: 'capacity',
                  type: 'number',
                  required: true,
                  min: 0,
                  max: 50,
                },
              ],
            },
          ],
        },
        {
          label: 'How far ahead',
          fields: [
            {
              name: 'bookingWindowDays',
              type: 'number',
              label: 'Booking window (days)',
              defaultValue: 90,
              min: 1,
              max: 730,
              admin: {
                description:
                  'How far ahead the calendar goes. 90 is about three months; the arrows stop there and a later date is refused by the server too. The calendar used to run forward forever.',
              },
            },
          ],
        },
      ],
    },
  ],
}
