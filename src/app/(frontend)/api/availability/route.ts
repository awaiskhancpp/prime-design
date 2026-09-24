import { NextResponse } from 'next/server'

import { resolveAvailability } from '@/lib/bookingAvailability'

/**
 * The booking calendar's data.
 *
 * Read-only and public, because the calendar it feeds is public. It returns
 * only what a visitor can already see by opening the booking modal — which
 * days are open and which times are free — and nothing about who booked
 * what. The window is decided here, not by the caller: there are no range
 * parameters to widen, so a crafted request cannot see further ahead than the
 * admin allows.
 *
 * `no-store` because a cached calendar is a wrong calendar: a day fills up
 * the moment someone books it.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const availability = await resolveAvailability()
    return NextResponse.json(availability, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    // Loud in the log, quiet to the caller: the modal falls back to showing
    // no availability rather than to inventing some.
    console.error('[availability] failed to resolve', error)
    return NextResponse.json({ error: 'Availability is unavailable right now.' }, { status: 503 })
  }
}
