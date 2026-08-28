const TIME_ZONE = 'America/Los_Angeles'

export type DateParts = { year: number; month0: number; day: number }

/** Reads the calendar date (Y/M/D) a given instant falls on in US Pacific time. */
export function parseDateParts(dateInput: string | Date | null | undefined): DateParts | null {
  if (!dateInput) return null
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = Number(parts.find((p) => p.type === 'year')?.value)
  const month = Number(parts.find((p) => p.type === 'month')?.value)
  const day = Number(parts.find((p) => p.type === 'day')?.value)
  if (!year || !month || !day) return null

  return { year, month0: month - 1, day }
}

/** Minutes to add to a UTC guess to land on the correct Pacific-time instant, DST included. */
function pacificOffsetMinutes(year: number, month0: number, day: number, hour: number): number {
  const utcGuess = new Date(Date.UTC(year, month0, day, hour))
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(utcGuess)

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asIfUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return (utcGuess.getTime() - asIfUtc) / 60000
}

/** Converts a Pacific-time wall-clock date + hour slot into a correct UTC ISO instant. */
export function pacificToUtcIso(year: number, month0: number, day: number, hour: number): string {
  const offsetMinutes = pacificOffsetMinutes(year, month0, day, hour)
  const utcMillis = Date.UTC(year, month0, day, hour) + offsetMinutes * 60000
  return new Date(utcMillis).toISOString()
}

/** Payload field-level validator: scheduled date must be tomorrow or later, in Pacific time. */
export function validateScheduledDate(value: string | Date | null | undefined) {
  if (!value) return true

  const parts = parseDateParts(value)
  if (!parts) return 'Enter a valid date.'

  const today = parseDateParts(new Date())
  if (!today) return 'Enter a valid date.'

  const valueMillis = Date.UTC(parts.year, parts.month0, parts.day)
  const todayMillis = Date.UTC(today.year, today.month0, today.day)

  if (valueMillis <= todayMillis) {
    return 'Scheduled date must be tomorrow or later (US Pacific Time).'
  }

  return true
}
