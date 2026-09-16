import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { dispatchLeadIntegrations } from '@/lib/leadIntegrations'
import { verifyRecaptcha } from '@/lib/recaptcha'
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
  | 'firstName'
  | 'lastName'
  | 'email'
  | 'phone'
  | 'subject'
  | 'message'
  | 'address'
  | 'zipCode'

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

/** The booking flow also needs somewhere to send an estimator. */
const APPOINTMENT_RULES: FieldRules<Field> = {
  ...BASE_RULES,
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
  ip ? createHash('sha256').update(`${ip}:${process.env.PAYLOAD_SECRET ?? ''}`).digest('hex').slice(0, 32) : undefined

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

  // ---- spam gate 3: reCAPTCHA ------------------------------------------
  // Inert until RECAPTCHA_SECRET_KEY exists; enforcing the moment it does.
  const forwarded = request.headers.get('x-forwarded-for') ?? ''
  const ip = forwarded.split(',')[0]?.trim() || ''
  const captcha = await verifyRecaptcha(str(body.recaptchaToken, 4000) || undefined, ip)
  if (captcha.error) {
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

  // ---- store -------------------------------------------------------------
  try {
    const payload = await getPayload({ config: configPromise })

    const submission = await payload.create({
      collection: 'contact-submissions',
      data: {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email.toLowerCase(),
        phone: toE164(values.phone),
        projectType,
        subject: values.subject || undefined,
        message: values.message,
        address: values.address || undefined,
        zipCode: values.zipCode || undefined,
        consultationType: str(body.consultationType, 200) || undefined,
        preferredDate: str(body.preferredDate, 100) || undefined,
        source,
        status: 'new',
        sourceUrl: str(body.sourceUrl, 500) || undefined,
        recaptchaStatus: captcha.status,
        recaptchaScore: captcha.score,
        notificationStatus: 'pending',
        crmStatus: 'pending',
        meta: {
          rawPhone: values.phone,
          userAgent: request.headers.get('user-agent')?.slice(0, 300) ?? null,
          ipHash: hashIp(ip) ?? null,
        },
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
          collection: 'contact-submissions',
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
