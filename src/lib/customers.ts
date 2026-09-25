import 'server-only'

import type { Payload } from 'payload'

/** What a booking knows about the person making it. */
export type CustomerDetails = {
  firstName: string
  lastName: string
  /** Already lowercased by the caller. */
  email: string
  /** Already normalised to E.164 by the caller. */
  phone: string
  address?: string
  zipCode?: string
  /** The comments they left on this booking. */
  notes?: string
}

/**
 * The contact profile for the person making a booking, creating it if this is
 * the first time we have seen them.
 *
 * Matching is on email first and phone second, never on name: two people share
 * a name far more often than an inbox, and merging two different customers
 * because both are called John Smith is the one mistake here that is hard to
 * undo. Both keys are normalised by the caller before they arrive, so
 * "(650) 235-4863" and "+1 650 235 4863" reach one profile.
 *
 * When a returning customer books, their profile is refreshed with what they
 * have just typed — it is meant to hold their details as they stand today, and
 * the appointment keeps its own snapshot of what was given at the time. Two
 * things are never overwritten:
 *
 *   - the email, which is the match key. A profile found by *phone* keeps the
 *     address it already had, so a recycled or mistyped number cannot move
 *     somebody else's profile onto a new inbox.
 *   - a populated field, by a blank one. A booking that omits the zip code
 *     should not erase the zip code we already hold.
 *
 * Never throws. The appointment is the record that matters; if the directory
 * cannot be updated the booking is still stored, unlinked, and the failure is
 * logged rather than shown to somebody who has just booked a consultation.
 */
export async function findOrCreateCustomer(
  payload: Payload,
  details: CustomerDetails,
): Promise<number | undefined> {
  const populated = <T>(value: T | undefined | '') => (value === '' ? undefined : value)

  /**
   * `address`, `zipCode` and `comments` are the booking form's extra
   * questions, so they belong in `customFields` — the same place the WordPress
   * admin keeps them — not among the core contact fields.
   *
   * Two fields next to them are deliberately left alone: `customFields.
   * phoneNumber`, which is a second number staff keep by hand and is not the
   * one the form asks for, and `customerNotes`, which is the core "notes left
   * by the customer" field. The site's booking form asks for "Comments", and
   * that is the custom field it fills.
   */
  const custom = {
    address: populated(details.address),
    zipCode: populated(details.zipCode),
    comments: populated(details.notes),
  }
  const customChanges = Object.fromEntries(
    Object.entries(custom).filter(([, value]) => value !== undefined),
  )

  const profile = {
    firstName: details.firstName,
    lastName: details.lastName,
    phone: populated(details.phone),
    customFields: Object.keys(customChanges).length ? customChanges : undefined,
  }
  /** Drops the keys with nothing in them, so a blank never clears a value. */
  const changes = Object.fromEntries(
    Object.entries(profile).filter(([, value]) => value !== undefined),
  )

  try {
    const byEmail = await payload.find({
      collection: 'customers',
      where: { email: { equals: details.email } },
      limit: 1,
      depth: 0,
    })
    let existing = byEmail.docs[0] as { id: number } | undefined

    if (!existing && details.phone) {
      const byPhone = await payload.find({
        collection: 'customers',
        where: { phone: { equals: details.phone } },
        limit: 1,
        depth: 0,
      })
      existing = byPhone.docs[0] as { id: number } | undefined
    }

    if (existing) {
      await payload.update({
        collection: 'customers',
        id: existing.id,
        data: changes as never,
      })
      return existing.id
    }

    const created = await payload.create({
      collection: 'customers',
      data: { ...changes, email: details.email } as never,
    })
    return created.id as number
  } catch (error) {
    /**
     * Most likely the unique index on `email`: two bookings from the same
     * person arriving together both looked, both found nothing, and both tried
     * to create. The index is what makes that safe — one insert wins, and the
     * loser reads the winner's row rather than making a duplicate.
     */
    try {
      const retry = await payload.find({
        collection: 'customers',
        where: { email: { equals: details.email } },
        limit: 1,
        depth: 0,
      })
      const doc = retry.docs[0] as { id: number } | undefined
      if (doc) return doc.id
    } catch {
      // fall through to the log below
    }
    console.error('[customers] could not resolve a contact profile', error)
    return undefined
  }
}
