import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { dispatchLeadIntegrations } from '@/lib/leadIntegrations'
import { checkBooking } from '@/lib/bookingAvailability'
import { findOrCreateCustomer } from '@/lib/customers'
import { verifyCaptcha } from '@/lib/captcha'
import {
  email as emailRule,
  minWords,
  optional,
  personName,
  streetAddress,
  usPhone,
  usZip,
  validateFields,
  type FieldRules,
} from '@/lib/formValidation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Field =
  'firstName' | 'lastName' | 'email' | 'phone' | 'subject' | 'message' | 'address' | 'zipCode'

/**
 * Server-side rules, using the very same validators the forms run in the
 * browser. The client copy is only there for fast feedback — this is the one
 * that decides, so a crafted request cannot get past it.
 */
const BASE_RULES: FieldRules<Field> = {
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email: emailRule,
  phone: usPhone,
  subject: optional(minWords('Subject', 2)),
  message: minWords('Message', 8),
}

/**
 * The booking flow also needs somewhere to send an estimator — and asks less
 * of the comment box.
 *
 * A booking has already said which service, which day and which time, so its
 * comment is context rather than the message itself. Holding it to the
 * contact form's eight words is what produced a stored lead reading "what the
 * fuck how am i suppose to write 8 wor": the rule did not raise the quality
 * of the data, it just made a person fight the form. Three words still stops
 * an empty or junk submit, and it matches what the modal now asks for — the
 * two must agree, or the form accepts what the server then rejects.
 */
const APPOINTMENT_RULES: FieldRules<Field> = {
  ...BASE_RULES,
  message: minWords('Comments', 3),
  address: streetAddress,
  zipCode: usZip,
}

const SOURCES = [
  'contact-page',
  'service-page',
  'location-page',
  'landing-page',
  'appointment',
  'other',
] as const

const PROJECT_TYPES = [
  'kitchen-remodeling',
  'bathroom-remodeling',
  'home-remodeling',
  'additions',
  'adu',
  'complete-renovation',
] as const

const str = (value: unknown, max = 5000) =>
  typeof value === 'string' ? value.trim().slice(0, max) : ''

/** Digits-only E.164 for a validated US number, so duplicates collapse. */
const toE164 = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const ten = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits
  return ten.length === 10 ? `+1${ten}` : value
}

/** The IP is only ever stored hashed, never raw. */
const hashIp = (ip: string) =>
  ip
    ? createHash('sha256')
        .update(`${ip}:${process.env.PAYLOAD_SECRET ?? ''}`)
        .digest('hex')
        .slice(0, 32)
    : undefined

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  // ---- spam gate 1: honeypot -------------------------------------------
  // A hidden field no human fills in. Answer 200 so a bot cannot tell it was
  // caught, but store nothing.
  if (str(body.company)) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // ---- spam gate 2: time trap ------------------------------------------
  const renderedAt = Number(body.renderedAt)
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < 2500) {
    return NextResponse.json({ ok: true }, { status: 200 })
  }

  // ---- spam gate 3: captcha --------------------------------------------
  // Cloudflare Turnstile when TURNSTILE_SECRET_KEY is set, reCAPTCHA when only
  // that pair is, inert when neither — `lib/captcha.ts` decides, and the
  // request body has no say in it. `recaptchaToken` is still accepted so a
  // page served before this change, still open in someone's browser, does not
  // have its submission rejected.
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0]?.trim() || ''
  const token = str(body.captchaToken, 4000) || str(body.recaptchaToken, 4000) || undefined

  /**
   * Local development submits without a token, on purpose.
   *
   * Turnstile's site key is registered against the live domain, so on
   * localhost Cloudflare answers the widget's challenge with 400 and the
   * widget never produces a token — `components/forms/Captcha.tsx` therefore
   * does not render it there. Without this the two halves disagree: the form
   * shows no challenge and the server then rejects the submission for not
   * having answered one, which is a form that cannot be tested locally at all.
   *
   * Both conditions are required and neither is attacker-controlled in the
   * place that matters: a deployed build runs with `NODE_ENV=production`, so
   * the exemption cannot be reached there however the Host header is spoofed.
   */
  const host = request.headers.get('host') ?? ''
  const isLocalRequest =
    process.env.NODE_ENV !== 'production' && /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host)

  // `skipped` is the collection's existing value for "no challenge was
  // checked"; a new status would mean a schema change for a development-only
  // path, and the stored `sourceUrl` already says it was localhost.
  const captcha = isLocalRequest ? { status: 'skipped' as const } : await verifyCaptcha(token, ip)
  if ('error' in captcha && captcha.error) {
    return NextResponse.json({ error: captcha.error }, { status: 400 })
  }

  // ---- validation -------------------------------------------------------
  const source = SOURCES.includes(body.source as (typeof SOURCES)[number])
    ? (body.source as (typeof SOURCES)[number])
    : 'contact-page'

  const values: Record<Field, string> = {
    firstName: str(body.firstName, 120),
    lastName: str(body.lastName, 120),
    email: str(body.email, 200),
    phone: str(body.phone, 40),
    subject: str(body.subject, 200),
    message: str(body.message, 5000),
    address: str(body.address, 300),
    zipCode: str(body.zipCode, 20),
  }

  const rules = source === 'appointment' ? APPOINTMENT_RULES : BASE_RULES
  const errors = validateFields(values, rules)
  if (Object.keys(errors).length) {
    return NextResponse.json({ error: 'Please check the form.', errors }, { status: 400 })
  }

  const projectType = PROJECT_TYPES.includes(body.projectType as (typeof PROJECT_TYPES)[number])
    ? (body.projectType as (typeof PROJECT_TYPES)[number])
    : undefined

  /**
   * The service the visitor picked, as a slug.
   *
   * Resolved against the Services collection rather than trusted: the browser
   * sends a slug, and a slug that names no service — a stale form, or someone
   * posting by hand — stores nothing instead of a dangling reference. The
   * lookup is by slug and not by id for the same reason the form posts one:
   * an id in page source is a database detail, a slug is already public.
   */
  const serviceSlug = str(body.service, 120)

  /**
   * A booking is re-checked here, against the same rules the calendar drew
   * itself from.
   *
   * The calendar runs in a browser the visitor controls, so what it offered
   * is a suggestion. This asks the server's own question — is that date open,
   * inside the window, far enough away, and does the day still have room? —
   * from the request's `appointmentDate` and `appointmentSlot` alone. A
   * request that skips the modal, replays an old one, or names a closed
   * Sunday is refused here regardless of what the page showed.
   */
  let booking: Awaited<ReturnType<typeof checkBooking>> | undefined
  if (source === 'appointment') {
    booking = await checkBooking(body.appointmentDate, body.appointmentSlot)
    if (!booking.ok) {
      return NextResponse.json({ error: booking.reason }, { status: 409 })
    }
  }

  // ---- store -------------------------------------------------------------
  try {
    const payload = await getPayload({ config: configPromise })

    let serviceId: number | undefined
    if (serviceSlug) {
      const match = await payload.find({
        collection: 'services',
        where: { slug: { equals: serviceSlug } },
        limit: 1,
        depth: 0,
      })
      serviceId = (match.docs[0] as { id?: number } | undefined)?.id
    }

    /**
     * Everything both kinds of submission carry. What differs is everything
     * that follows: an enquiry has a subject and a lead's lifecycle, a booking
     * has a day, a slot, an address and an appointment's lifecycle.
     */
    const shared = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email.toLowerCase(),
      phone: toE164(values.phone),
      service: serviceId,
      message: values.message,
      // Which form, in words. The browser names itself; an unnamed form
      // stores nothing rather than a guess made from the URL.
      formName: str(body.formName, 120) || undefined,
      sourceUrl: str(body.sourceUrl, 500) || undefined,
      // Provider-neutral in meaning despite the name: the stored column
      // predates Turnstile. Turnstile never sets a score.
      recaptchaStatus: captcha.status,
      recaptchaScore: 'score' in captcha ? captcha.score : undefined,
      notificationStatus: 'pending' as const,
      crmStatus: 'pending' as const,
      meta: {
        rawPhone: values.phone,
        userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
        ipHash: hashIp(ip) ?? null,
      },
    }

    /**
     * A booking is an appointment, an enquiry is a lead, and the two live in
     * separate collections. `source` is what decides — it is also what the
     * validation rules and the availability re-check above keyed off.
     */
    const collection = booking?.ok ? ('appointments' as const) : ('contact-submissions' as const)

    /**
     * Booking a consultation puts the person in the customer directory. An
     * enquiry deliberately does not: somebody asking a question has not
     * become a customer, and turning every question into a directory entry
     * fills it with people who never booked anything.
     */
    const customerId = booking?.ok
      ? await findOrCreateCustomer(payload, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email.toLowerCase(),
          phone: toE164(values.phone),
          address: values.address || undefined,
          zipCode: values.zipCode || undefined,
          notes: values.message,
        })
      : undefined

    const reference = str(body.orderId, 40) || undefined

    /**
     * Every appointment gets an order, even though every consultation is free.
     *
     * It opens exactly as the WordPress admin shows one: Open, Not Fulfilled,
     * Not Paid, nothing owed. Keeping it separate is the point — it gives
     * price, payment and fulfilment somewhere to live that is not the
     * appointment's own status, so "Completed" can never be confused with
     * "Paid". Nothing here takes a payment; these are the fields that would
     * hold one if anything ever did.
     *
     * A failure is not allowed to lose the booking: the appointment is stored
     * with no order rather than not stored at all.
     */
    let orderId: number | undefined
    if (booking?.ok) {
      try {
        const order = await payload.create({
          collection: 'orders',
          data: {
            reference,
            customer: customerId,
            orderStatus: 'open',
            fulfillmentStatus: 'not-fulfilled',
            paymentStatus: 'not-paid',
            subtotal: 0,
            total: 0,
            totalPayments: 0,
            balanceDue: 0,
          },
        })
        orderId = order.id as number
      } catch (error) {
        console.error('[contact] could not open an order for the booking', error)
      }
    }

    const submission = booking?.ok
      ? await payload.create({
          collection: 'appointments',
          data: {
            ...shared,
            customer: customerId,
            order: orderId,
            consultationType: str(body.consultationType, 200) || undefined,
            // The visit as two instants, resolved by the server from the day
            // and slot it validated — not as the browser described them. The
            // slot is a Pacific wall-clock time, so `checkBooking` converts it
            // rather than trusting whatever timezone this process runs in.
            startsAt: booking.startsAt,
            endsAt: booking.endsAt,
            // The reference the modal prints on its confirmation screen and
            // writes into the calendar invite, so the number a caller quotes
            // can be looked up.
            bookingReference: reference,
            address: values.address || undefined,
            zipCode: values.zipCode || undefined,
            status: 'pending-approval' as const,
          },
        })
      : await payload.create({
          collection: 'contact-submissions',
          data: {
            ...shared,
            projectType,
            subject: values.subject || undefined,
            // `appointment` is no longer one of a lead's sources — it is what
            // sends a submission to Customers instead. A request that claims
            // it but fails the booking re-check never reaches here (409
            // above); one that claims it with no booking at all is recorded
            // as what it actually is, a contact-page enquiry.
            source: source === 'appointment' ? 'contact-page' : source,
            status: 'new' as const,
          },
        })

    // Delivery is a separate concern and is currently inert. It runs after the
    // lead is safely stored and can never fail the request.
    try {
      const delivery = await dispatchLeadIntegrations(submission)
      if (
        delivery.notificationStatus !== submission.notificationStatus ||
        delivery.crmStatus !== submission.crmStatus ||
        delivery.deliveryError
      ) {
        await payload.update({
          collection,
          id: submission.id,
          data: {
            notificationStatus: delivery.notificationStatus,
            crmStatus: delivery.crmStatus,
            deliveryError: delivery.deliveryError,
          },
        })
      }
    } catch (error) {
      console.error('[contact] lead delivery failed', error)
    }

    return NextResponse.json({ ok: true, id: submission.id }, { status: 201 })
  } catch (error) {
    console.error('[contact] could not store submission', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or call us.' },
      { status: 500 },
    )
  }
}
