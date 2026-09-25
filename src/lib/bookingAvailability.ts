import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

import { parseDateParts, pacificToUtcIso } from './pacificTime'

/**
 * What can be booked, decided on the server.
 *
 * One module answers both questions — "what should the calendar offer?" and
 * "is this booking allowed?" — because the moment those are answered in two
 * places they disagree, and the disagreement is the vulnerability: the
 * calendar is rendered in a browser the visitor controls, so it is a
 * suggestion, never a guarantee. `/api/availability` renders from this and
 * `/api/contact` re-checks against it, so editing the page, replaying a
 * request or posting by hand cannot book something the rules forbid.
 *
 * The rules live in the `booking-settings` global. Everything here used to be
 * hardcoded in the browser, including a pseudo-random generator that invented
 * the "3 left" badges.
 */

export type BookingSlot = {
  /** The time as offered and stored, e.g. "09:00 am". */
  time: string
  available: boolean
}

export type BookingDay = {
  /** `YYYY-MM-DD` in the business's own calendar terms. */
  date: string
  status: 'open' | 'full' | 'closed' | 'past'
  /** Remaining capacity; 0 unless `status` is 'open'. */
  remaining: number
  slots: BookingSlot[]
}

export type BookingRules = {
  slots: string[]
  closedWeekdays: number[]
  closedDates: Set<string>
  dateCapacities: Map<string, number>
  dailyCapacity: number
  bookingWindowDays: number
  minNoticeHours: number
  /** How long one consultation runs; the appointment's end time comes from it. */
  appointmentMinutes: number
}

/** Sensible values when the global has never been saved. */
const DEFAULTS: BookingRules = {
  slots: ['09:00 am', '11:00 am', '01:00 pm', '03:00 pm'],
  closedWeekdays: [0],
  closedDates: new Set(),
  dateCapacities: new Map(),
  dailyCapacity: 3,
  bookingWindowDays: 90,
  minNoticeHours: 24,
  appointmentMinutes: 60,
}

/** `YYYY-MM-DD` for a Date, read in local (server) time. */
export const dateKey = (value: Date) =>
  `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`

/** The key for a stored date value, which may be a date-only or a timestamp. */
const storedDateKey = (value: unknown) => {
  if (typeof value !== 'string' && !(value instanceof Date)) return null
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  // Payload writes a date-only field as midnight UTC. Reading it back with
  // local getters can land on the previous day west of Greenwich, so the key
  // is taken in UTC — the admin picked a calendar day, not an instant.
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, '0')}-${String(
    parsed.getUTCDate(),
  ).padStart(2, '0')}`
}

const numberOr = (value: unknown, fallback: number) => {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback
}

export async function resolveBookingRules(): Promise<BookingRules> {
  if (!process.env.DATABASE_URL) return DEFAULTS

  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    slug: 'booking-settings',
    depth: 0,
  })) as unknown as Record<string, unknown>

  const slots = Array.isArray(settings.slots)
    ? (settings.slots as Array<{ time?: string | null }>)
        .map((row) => (row?.time ?? '').trim())
        .filter(Boolean)
    : []

  const closedWeekdays = Array.isArray(settings.closedWeekdays)
    ? (settings.closedWeekdays as string[])
        .map((value) => Number(value))
        .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6)
    : DEFAULTS.closedWeekdays

  const closedDates = new Set<string>()
  for (const row of (settings.closedDates as Array<{ date?: unknown }> | undefined) ?? []) {
    const key = storedDateKey(row?.date)
    if (key) closedDates.add(key)
  }

  const dateCapacities = new Map<string, number>()
  for (const row of (settings.dateCapacities as
    Array<{ date?: unknown; capacity?: unknown }> | undefined) ?? []) {
    const key = storedDateKey(row?.date)
    if (key) dateCapacities.set(key, Math.max(0, numberOr(row?.capacity, 0)))
  }

  return {
    slots: slots.length ? slots : DEFAULTS.slots,
    closedWeekdays,
    closedDates,
    dateCapacities,
    // Clamped, not trusted: these are numbers an admin types, and a negative
    // or absurd one would otherwise become a calendar nobody can use.
    dailyCapacity: Math.min(
      50,
      Math.max(1, numberOr(settings.dailyCapacity, DEFAULTS.dailyCapacity)),
    ),
    bookingWindowDays: Math.min(
      730,
      Math.max(1, numberOr(settings.bookingWindowDays, DEFAULTS.bookingWindowDays)),
    ),
    minNoticeHours: Math.min(
      720,
      Math.max(0, numberOr(settings.minNoticeHours, DEFAULTS.minNoticeHours)),
    ),
    appointmentMinutes: Math.min(
      480,
      Math.max(5, numberOr(settings.appointmentMinutes, DEFAULTS.appointmentMinutes)),
    ),
  }
}

/** How many appointments are already booked per date, for a date range. */
async function bookedCounts(fromKey: string, toKey: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>()
  if (!process.env.DATABASE_URL) return counts

  const payload = await getPayload({ config: configPromise })
  /**
   * Widened by a day at each end. The range is asked in calendar days but
   * `startsAt` is an instant, and the first and last day's instants sit up to
   * a day either side of the naive UTC boundary; a booking on the window's
   * first morning would otherwise not be counted.
   */
  const { docs } = await payload.find({
    collection: 'appointments',
    where: {
      and: [
        { startsAt: { greater_than_equal: `${fromKey}T00:00:00.000Z` } },
        { startsAt: { less_than_equal: `${toKey}T23:59:59.999Z` } },
        // A booking that is not happening gives its slot back.
        { status: { not_in: ['cancelled', 'no-show'] } },
      ],
    },
    limit: 5000,
    depth: 0,
    pagination: false,
  })

  /**
   * Keyed by the Pacific calendar day, which round-trips exactly: `startsAt`
   * was built from the `YYYY-MM-DD` the visitor picked, read as a Pacific wall
   * clock, so reading it back in Pacific returns that same string whatever
   * timezone the server or the browser is in.
   */
  for (const doc of docs as Array<{ startsAt?: unknown }>) {
    const parts = parseDateParts(doc.startsAt as string | null | undefined)
    if (!parts) continue
    const key = `${parts.year}-${String(parts.month0 + 1).padStart(2, '0')}-${String(parts.day).padStart(2, '0')}`
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

/** The capacity that applies to one date, override first. */
export const capacityFor = (key: string, rules: BookingRules) =>
  rules.dateCapacities.has(key) ? (rules.dateCapacities.get(key) as number) : rules.dailyCapacity

/**
 * The calendar, as the server sees it.
 *
 * `days` covers today through the end of the booking window; anything the
 * browser asks for outside that is simply not returned, so a crafted range
 * cannot widen the window.
 */
export async function resolveAvailability(now = new Date()): Promise<{
  rules: Pick<BookingRules, 'slots' | 'bookingWindowDays' | 'minNoticeHours'>
  lastBookableDate: string
  days: BookingDay[]
}> {
  const rules = await resolveBookingRules()

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const end = new Date(start)
  end.setDate(end.getDate() + rules.bookingWindowDays)

  const widenedStart = new Date(start)
  widenedStart.setDate(widenedStart.getDate() - 1)
  const widenedEnd = new Date(end)
  widenedEnd.setDate(widenedEnd.getDate() + 1)
  const counts = await bookedCounts(dateKey(widenedStart), dateKey(widenedEnd))
  const earliest = new Date(now.getTime() + rules.minNoticeHours * 60 * 60 * 1000)

  const days: BookingDay[] = []
  for (let cursor = new Date(start); cursor <= end; cursor.setDate(cursor.getDate() + 1)) {
    const day = new Date(cursor)
    const key = dateKey(day)
    const capacity = capacityFor(key, rules)
    const closed =
      capacity <= 0 || rules.closedWeekdays.includes(day.getDay()) || rules.closedDates.has(key)

    if (closed) {
      days.push({ date: key, status: 'closed', remaining: 0, slots: [] })
      continue
    }

    const taken = counts.get(key) ?? 0
    const remaining = Math.max(0, capacity - taken)

    // A slot is offered only if it is far enough away. On today that removes
    // the times that have already passed, which is what let a visitor book
    // "today at 01:00 am" at nine in the morning.
    const slots = rules.slots.map((time) => ({
      time,
      available: remaining > 0 && slotStart(day, time) >= earliest,
    }))

    const bookable = slots.some((slot) => slot.available)
    days.push({
      date: key,
      status: bookable ? 'open' : 'full',
      remaining: bookable ? Math.min(remaining, slots.filter((s) => s.available).length) : 0,
      slots,
    })
  }

  return {
    rules: {
      slots: rules.slots,
      bookingWindowDays: rules.bookingWindowDays,
      minNoticeHours: rules.minNoticeHours,
    },
    lastBookableDate: dateKey(end),
    days,
  }
}

/** "01:30 pm" → that moment on `day`. Invalid text sorts to the far future. */
export function slotStart(day: Date, time: string): Date {
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(time.trim())
  if (!match) return new Date(8640000000000000)
  let hours = Number(match[1]) % 12
  if (match[3].toLowerCase() === 'pm') hours += 12
  const result = new Date(day)
  result.setHours(hours, Number(match[2]), 0, 0)
  return result
}

export type BookingCheck =
  | {
      ok: true
      date: Date
      /** The calendar day the visitor picked, `YYYY-MM-DD`. */
      key: string
      /** The slot as offered, e.g. "09:00 am". */
      slot: string
      /** The slot resolved to an instant, read as a Pacific wall clock. */
      startsAt: string
      /** `startsAt` plus the configured appointment length. */
      endsAt: string
    }
  | { ok: false; reason: string }

/**
 * A validated day + slot as two instants.
 *
 * The slot is a Pacific wall-clock time — "09:00 am" means nine in the morning
 * in Campbell, not on whatever timezone the server happens to run in — so the
 * conversion goes through `pacificToUtcIso` rather than `new Date(...)`.
 */
function slotInstants(key: string, slot: string, minutes: number) {
  const [year, month, day] = key.split('-').map(Number)
  const match = /^(\d{1,2}):(\d{2})\s*(am|pm)$/i.exec(slot.trim())
  let hour = match ? Number(match[1]) % 12 : 9
  if (match && match[3].toLowerCase() === 'pm') hour += 12
  const minute = match ? Number(match[2]) : 0

  const startsAt = pacificToUtcIso(year, month - 1, day, hour, minute)
  const endsAt = new Date(new Date(startsAt).getTime() + minutes * 60000).toISOString()
  return { startsAt, endsAt }
}

/**
 * Is this booking allowed? The question `/api/contact` asks before storing.
 *
 * Deliberately re-derives everything from the request's own date and slot and
 * the settings — it never trusts a "remaining" count or a status the browser
 * sent, because those are exactly what an attacker would forge.
 */
export async function checkBooking(dateInput: unknown, slotInput: unknown): Promise<BookingCheck> {
  const rules = await resolveBookingRules()
  const slot = typeof slotInput === 'string' ? slotInput.trim() : ''
  const raw = typeof dateInput === 'string' ? dateInput.trim() : ''

  // `YYYY-MM-DD` only. Parsing free text here is how "any string the client
  // felt like" became a stored appointment.
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return { ok: false, reason: 'Pick a date for your visit.' }
  const [year, month, dayOfMonth] = raw.split('-').map(Number)
  const date = new Date(year, month - 1, dayOfMonth)
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== dayOfMonth
  ) {
    return { ok: false, reason: 'That date does not exist.' }
  }

  if (!rules.slots.includes(slot)) return { ok: false, reason: 'Pick a time for your visit.' }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (date < today) return { ok: false, reason: 'That date has already passed.' }

  const lastDay = new Date(today)
  lastDay.setDate(lastDay.getDate() + rules.bookingWindowDays)
  if (date > lastDay) {
    return { ok: false, reason: 'That date is further ahead than we take bookings.' }
  }

  const key = dateKey(date)
  const capacity = capacityFor(key, rules)
  if (capacity <= 0 || rules.closedWeekdays.includes(date.getDay()) || rules.closedDates.has(key)) {
    return { ok: false, reason: 'We are closed that day. Please choose another.' }
  }

  if (slotStart(date, slot) < new Date(now.getTime() + rules.minNoticeHours * 60 * 60 * 1000)) {
    return { ok: false, reason: 'That time is too soon. Please choose a later one.' }
  }

  // Asked over three days for the reason `bookedCounts` explains, then read
  // back for the one that matters.
  const before = new Date(date)
  before.setDate(before.getDate() - 1)
  const after = new Date(date)
  after.setDate(after.getDate() + 1)
  const counts = await bookedCounts(dateKey(before), dateKey(after))
  if ((counts.get(key) ?? 0) >= capacity) {
    return { ok: false, reason: 'That day is fully booked. Please choose another.' }
  }

  return { ok: true, date, key, slot, ...slotInstants(key, slot, rules.appointmentMinutes) }
}
