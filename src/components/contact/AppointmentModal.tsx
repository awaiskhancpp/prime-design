'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Pencil, X } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'

type AppointmentModalProps = {
  consultation: string | null
  onClose: () => void
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

function buildMonthGrid(year: number, month: number) {
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<Date | null> = Array.from({ length: firstWeekday }, () => null)
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day))
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

// Each open day has 5 bookable appointment slots.
const DAILY_TIME_SLOTS = ['12:00 am', '01:00 am', '02:00 am', '03:00 am', '10:00 pm']

function getDaySeed(day: Date) {
  return day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate()
}

// Deterministic pseudo-random booked slots per day, so the demo shows a
// realistic mix of open/taken slots without a real backend. The same date
// always produces the same result. Swap this for a real per-day
// availability lookup once appointments are wired up to a backend.
function getBookedSlotIndexes(day: Date) {
  let x = getDaySeed(day)
  const booked = new Set<number>()
  for (let i = 0; i < DAILY_TIME_SLOTS.length; i += 1) {
    x = (x * 1103515245 + 12345) & 0x7fffffff
    if (x % 3 === 0) booked.add(i)
  }
  return booked
}

type DayStatus =
  { kind: 'past' } | { kind: 'closed' } | { kind: 'full' } | { kind: 'open'; remaining: number }

function getDayStatus(day: Date, today: Date): DayStatus {
  const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate())
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  if (dayStart < todayStart) return { kind: 'past' }
  if (day.getDay() === 0) return { kind: 'closed' }
  const remaining = DAILY_TIME_SLOTS.length - getBookedSlotIndexes(day).size
  if (remaining <= 0) return { kind: 'full' }
  return { kind: 'open', remaining }
}

function AppointmentCalendar({
  selectedDate,
  onSelect,
}: {
  selectedDate: Date | null
  onSelect: (date: Date) => void
}) {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState((selectedDate ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState((selectedDate ?? today).getMonth())

  const cells = useMemo(() => buildMonthGrid(viewYear, viewMonth), [viewYear, viewMonth])
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth()

  function goToPreviousMonth() {
    if (isCurrentMonth) return
    setViewMonth((month) => {
      if (month === 0) {
        setViewYear((year) => year - 1)
        return 11
      }
      return month - 1
    })
  }

  function goToNextMonth() {
    setViewMonth((month) => {
      if (month === 11) {
        setViewYear((year) => year + 1)
        return 0
      }
      return month + 1
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="font-display text-2xl font-medium text-ink">
          {MONTH_LABELS[viewMonth]} <span className="text-ink-2/50">{viewYear}</span>
        </p>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={goToPreviousMonth}
            disabled={isCurrentMonth}
            aria-label="Previous month"
            className="flex h-8 w-8 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={goToNextMonth}
            aria-label="Next month"
            className="flex h-8 w-8 items-center justify-center border border-line text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      {/* Explicit inline grid-template-columns instead of the `grid-cols-7`
          utility class — that class alone was rendering as a single column
          in your build. An inline style is generated at runtime by React,
          not by a CSS build step, so there is nothing left that can drop it. */}
      <div
        className="mt-3 grid gap-y-1 text-center"
        style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}
      >
        {WEEKDAY_LABELS.map((label, index) => (
          <span key={index} className="text-xs font-semibold uppercase tracking-wide text-ink-2/40">
            {label}
          </span>
        ))}

        {cells.map((day, index) => {
          if (!day) return <span key={index} />

          const status = getDayStatus(day, today)
          const selected = selectedDate !== null && isSameDay(day, selectedDate)
          const clickable = status.kind === 'open'

          return (
            <button
              key={index}
              type="button"
              disabled={!clickable}
              onClick={() => clickable && onSelect(day)}
              className={`mx-auto flex h-10 w-10 flex-col items-center justify-center gap-0.5 rounded text-xs transition-colors ${
                selected
                  ? 'bg-brass font-semibold text-white'
                  : clickable
                    ? 'text-ink hover:bg-paper-2'
                    : 'cursor-not-allowed text-gray-300'
              }`}
            >
              <span>{day.getDate()}</span>
              {status.kind === 'open' ? (
                <span
                  className={`text-[10px] font-semibold ${selected ? 'text-white' : 'text-emerald-600'}`}
                >
                  {status.remaining} left
                </span>
              ) : status.kind === 'full' ? (
                <span className="text-[10px] font-medium text-red-400">Full</span>
              ) : status.kind === 'closed' ? (
                <span className="text-[10px] font-medium text-white">Closed</span>
              ) : (
                <span className="text-[10px] text-gray-300">—</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function AppointmentScheduler({
  consultation,
  onDone,
}: {
  consultation: string
  onDone?: () => void
}) {
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null)

  const dateLabel = selectedDate
    ? selectedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null

  function next() {
    setStep((current) => Math.min(current + 1, 3))
  }

  function back() {
    setStep((current) => Math.max(current - 1, 1))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const firstName = String(data.get('firstName') || '').trim()
    const lastName = String(data.get('lastName') || '').trim()
    setCustomer({
      name: [firstName, lastName].filter(Boolean).join(' '),
      email: String(data.get('email') || '').trim(),
    })
    setStep(3)
  }

  return (
    <div
      className={`relative w-full max-w-4xl overflow-hidden border border-line bg-white shadow-xl ${
        step === 3 || step === 4 ? 'h-auto' : 'h-[min(760px,calc(100vh-2rem))]'
      }`}
    >
      <div key={step} className="h-full animate-fade-in">
        {step === 1 ? (
          <div className="grid h-full md:grid-cols-[0.8fr_1.2fr]">
            <aside className="bg-paper-2 px-8 py-6 text-center md:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center">
                <Image src="/date-and-time.svg" alt="" width={64} height={64} aria-hidden />
              </div>
              <h2 className="mt-4 font-display text-2xl font-semibold text-ink">
                Select Date &amp; Time
              </h2>
              <p className="mt-2 text-sm leading-6 text-ink-2/65">
                Please select date and time for your appointment
              </p>
              <p className="mt-12 text-sm font-semibold text-ink">Questions?</p>
              <a className="mt-2 block text-sm text-brass-deep" href="tel:6504608650">
                Call (650) 460-8650
              </a>
            </aside>
            <div className="px-8 py-6 md:px-10 pt-20">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                {consultation}
              </p>

              <div className="mt-3">
                <AppointmentCalendar
                  selectedDate={selectedDate}
                  onSelect={(day) => {
                    setSelectedDate(day)
                    setTime(null)
                  }}
                />
              </div>

              {selectedDate ? (
                <div key={selectedDate.toDateString()} className="animate-fade-in">
                  <p className="mt-4 text-sm text-ink-2/70">
                    Pick a slot for{' '}
                    <span className="font-semibold text-brass-deep">{dateLabel}</span>
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {DAILY_TIME_SLOTS.map((slot, index) => {
                      const taken = getBookedSlotIndexes(selectedDate).has(index)
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={taken}
                          onClick={() => {
                            setTime(slot)
                            next()
                          }}
                          className={`border py-1 text-xs transition-colors ${
                            taken
                              ? 'cursor-not-allowed border-line text-gray-300 line-through'
                              : time === slot
                                ? 'border-brass bg-brass text-white'
                                : 'border-line text-ink hover:border-brass hover:text-brass-deep'
                          }`}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <p className="mt-8 text-sm text-ink-2/50">
                  Choose a date above to see available times.
                </p>
              )}
            </div>
          </div>
        ) : step === 2 ? (
          <form onSubmit={submit} className="grid h-full md:grid-cols-[0.8fr_1.2fr]">
            <aside className="bg-paper-2 px-8 py-12 text-center md:px-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center">
                <Image src="/information.svg" alt="" width={80} height={80} aria-hidden />
              </div>
              <h2 className="mt-8 font-display text-3xl font-semibold text-ink">
                Enter Your Information
              </h2>
              <p className="mt-3 text-base leading-7 text-ink-2/65">
                Please enter your contact information
              </p>
              <p className="mt-20 text-sm font-semibold text-ink">Questions?</p>
              <a className="mt-2 block text-base text-brass-deep" href="tel:6504608650">
                Call (650) 460-8650
              </a>
            </aside>
            <div className="px-8 py-12 md:px-12">
              <h3 className="font-display text-3xl font-medium text-ink">Customer Information</h3>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <Input name="firstName" placeholder="First Name" required />
                <Input name="lastName" placeholder="Last Name" required />
                <Input type="email" name="email" placeholder="Email Address" required />
                <Input type="tel" name="phone" placeholder="Phone Number" required />
                <Input className="sm:col-span-2" name="address" placeholder="Address" />
                <Input name="zipCode" placeholder="Zip Code" />
                <Textarea className="sm:col-span-2" name="comments" placeholder="Comments" />
              </div>
              <div className="mt-10 flex justify-between">
                <Button type="button" variant="outline" onClick={back}>
                  ← Back
                </Button>
                <Button type="submit">Next →</Button>
              </div>
            </div>
          </form>
        ) : step === 3 ? (
          <div className="grid h-full md:grid-cols-[0.8fr_1.2fr]">
            <aside className="bg-paper-2 px-8 py-12 text-center md:px-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center">
                <Image src="/verify-information.svg" alt="" width={80} height={80} aria-hidden />
              </div>
              <h2 className="mt-8 font-display text-3xl font-semibold text-ink">
                Verify Order Details
              </h2>
              <p className="mt-3 text-base leading-7 text-ink-2/65">
                Double check your reservation details and click submit if everything is correct
              </p>
            </aside>
            <div className="px-8 py-12 md:px-12">
              <h3 className="font-display text-3xl font-medium text-ink">{consultation}</h3>
              <p className="mt-3 text-lg text-brass-deep">
                {dateLabel}, {time}
              </p>

              {customer ? (
                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                    Customer
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center border border-brass/30 bg-paper-2 text-sm font-semibold text-ink">
                      {getInitials(customer.name)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-display text-base font-medium text-ink">
                          {customer.name || 'Guest'}
                        </p>
                        <button
                          type="button"
                          onClick={back}
                          aria-label="Edit customer information"
                          className="flex h-6 w-6 shrink-0 items-center justify-center text-brass transition-colors hover:text-brass-deep"
                        >
                          <Pencil className="h-3.5 w-3.5" aria-hidden />
                        </button>
                      </div>
                      {customer.email ? (
                        <p className="truncate text-sm text-ink-2/65">{customer.email}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-10 border-t border-line pt-6">
                  <p className="text-sm text-ink-2/60">
                    Customer information will be submitted with this appointment request.
                  </p>
                </div>
              )}
              <div className="mt-10 flex justify-between">
                <Button type="button" variant="outline" onClick={back} className="flex gap-1">
                  <ArrowLeft /> Back
                </Button>
                <Button type="button" onClick={() => setStep(4)} className="flex gap-1">
                  Submit <ArrowRight />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center px-8 py-20 text-center md:px-24">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-green-200 text-5xl text-green-700">
              ✓
            </div>
            <h2 className="mt-8 font-display text-4xl font-medium text-ink">
              Appointment Confirmed
            </h2>
            <p className="mt-3 text-lg text-ink-2/65">We look forward to seeing you.</p>
            <p className="mt-8 text-lg text-ink">{consultation}</p>
            <p className="mt-2 text-brass-deep">
              {dateLabel}, {time}
            </p>
            {onDone && (
              <Button type="button" className="mt-10" onClick={onDone}>
                Done
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function AppointmentModal({ consultation, onClose }: AppointmentModalProps) {
  if (!consultation) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Book appointment"
    >
      <div className="relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-3 z-10 flex h-12 w-12 items-center justify-center text-ink transition-colors hover:text-brass"
          aria-label="Close appointment dialog"
        >
          <X className="h-6 w-6" strokeWidth={2.25} aria-hidden />
        </button>
        <AppointmentScheduler consultation={consultation} onDone={onClose} />
      </div>
    </div>
  )
}
