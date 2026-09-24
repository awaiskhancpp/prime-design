'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/utils'
import type { FormServiceOption } from '@/lib/formServices'
import { Captcha, captchaEnabled, type CaptchaHandle } from './Captcha'
import {
  email as emailRule,
  minWords,
  optional,
  personName,
  usPhone,
  validateFields,
  type FieldRules,
} from '@/lib/formValidation'

type FieldName = 'firstName' | 'lastName' | 'email' | 'phone' | 'subject' | 'message'

const baseRules: FieldRules<FieldName> = {
  firstName: personName('First name'),
  lastName: personName('Last name'),
  email: emailRule,
  phone: usPhone,
  // Subject is the only genuinely optional field, but it still has to look
  // like a subject if it is filled in.
  subject: optional(minWords('Subject', 2)),
  message: minWords('Your message', 8),
}

const requiredSubjectRules: FieldRules<FieldName> = {
  ...baseRules,
  subject: minWords('Subject', 2),
}

const EMPTY: Record<FieldName, string> = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
}

/**
 * The shared contact / lead form.
 *
 * The markup matches what the contact section rendered before — the same
 * labels, grid and control components — with validation added on top: every
 * field is checked on blur once it has been touched, and again on submit,
 * which is blocked while anything is invalid.
 *
 * Rules live in `lib/formValidation` so the appointment modal and the
 * service-location form enforce exactly the same ones.
 */
export function LeadForm({
  submitLabel,
  services,
  formName,
  className,
  inputClassName,
  textareaClassName,
  submitClassName,
  messagePlaceholder,
  messageLabel = 'Tell Us About Your Project',
  layout = 'split',
  requireSubject = false,
  source = 'contact-page',
}: {
  submitLabel: string
  className?: string
  /** Extra classes for the controls (the gallery layout spaces them itself). */
  inputClassName?: string
  /** Extra classes for the message control only. */
  textareaClassName?: string
  /** Extra classes for the submit button. */
  submitClassName?: string
  messagePlaceholder?: string
  messageLabel?: string
  /** 'split' pairs first/last and email/phone; 'stacked' gives each its own row. */
  layout?: 'split' | 'stacked'
  /** The location hero form asks for a subject; the contact sections do not. */
  requireSubject?: boolean
  /** Which form this is, recorded on the stored submission. */
  source?: 'contact-page' | 'service-page' | 'location-page' | 'landing-page' | 'other'
  /**
   * The service dropdown's options, from `resolveFormServices()`.
   *
   * Passed in rather than fetched here because this is a client component and
   * the list is Payload content: the page that renders the form is a server
   * component and already has a database connection. Omitted (or empty) hides
   * the field entirely, so a form that has no business asking — the gallery's
   * short enquiry, say — is unchanged.
   */
  services?: FormServiceOption[]
  /**
   * The form's own name, stored on the lead. `source` says what kind of page
   * this was and `sourceUrl` says which one, but a page can carry three
   * forms; this is what tells them apart in the admin list.
   */
  formName?: string
}) {
  const RULES = requireSubject ? requiredSubjectRules : baseRules
  const [values, setValues] = useState<Record<FieldName, string>>(EMPTY)
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({})
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)
  const [formError, setFormError] = useState<string>()
  const [done, setDone] = useState(false)
  const [honeypot, setHoneypot] = useState('')
  // The chosen service's slug. Its own state rather than a member of
  // `values`: everything in there is a validated free-text field, and this is
  // a closed list that cannot be typed into or be wrong.
  const [serviceSlug, setServiceSlug] = useState('')
  // Captcha tokens are single-use and time-limited, so the token is read from
  // the widget at submit time rather than mirrored into React state when the
  // challenge is solved — a person who solves it and then spends a few minutes
  // writing their message would otherwise post an expired token.
  const captcha = useRef<CaptchaHandle>(null)
  // Submissions faster than a couple of seconds after render are bots. The
  // clock is read in an effect, not during render — `Date.now()` is impure, so
  // calling it in the render body is both a lint error and unstable across
  // re-renders. 0 until mounted, which the endpoint reads as "no timing info"
  // rather than as an instant submission.
  const renderedAt = useRef(0)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const setValue = (name: FieldName, value: string) => {
    setValues((previous) => ({ ...previous, [name]: value }))
    // Re-validate as they type, but only once the field has been left or the
    // form submitted — errors should not appear while first filling it in.
    if (touched[name] || submitted) {
      const message = RULES[name]?.(value)
      setErrors((previous) => ({ ...previous, [name]: message }))
    }
  }

  const blur = (name: FieldName) => {
    setTouched((previous) => ({ ...previous, [name]: true }))
    setErrors((previous) => ({ ...previous, [name]: RULES[name]?.(values[name]) }))
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const found = validateFields(values, RULES)
    setErrors(found)
    const firstInvalid = (Object.keys(RULES) as FieldName[]).find((name) => found[name])
    if (firstInvalid) {
      document.getElementById(`lead-${firstInvalid}`)?.focus()
      return
    }
    const captchaToken = captcha.current?.getToken()
    if (captchaEnabled() && !captchaToken) {
      setFormError('Please complete the captcha.')
      return
    }

    setSending(true)
    setFormError(undefined)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          service: serviceSlug || undefined,
          source,
          formName,
          sourceUrl: typeof window === 'undefined' ? undefined : window.location.href,
          captchaToken,
          renderedAt: renderedAt.current,
          // Honeypot — a real person never fills this in.
          company: honeypot,
        }),
      })
      const result = (await response.json().catch(() => ({}))) as {
        errors?: Partial<Record<FieldName, string>>
        error?: string
      }
      if (!response.ok) {
        if (result.errors) setErrors(result.errors)
        setFormError(result.error ?? 'Something went wrong. Please try again.')
        return
      }
      setDone(true)
      setValues(EMPTY)
      setServiceSlug('')
      setTouched({})
      setSubmitted(false)
    } catch {
      setFormError('Could not reach the server. Please try again or call us.')
    } finally {
      setSending(false)
      // The token was spent the moment the server checked it, and a rejected
      // one is spent too — re-arm the widget either way, or a second attempt
      // after a validation error fails on a used token.
      captcha.current?.reset()
    }
  }

  const field = (name: FieldName) => ({
    id: `lead-${name}`,
    name,
    value: values[name],
    onChange: (event: { target: { value: string } }) => setValue(name, event.target.value),
    onBlur: () => blur(name),
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `lead-${name}-error` : undefined,
    className: cn(inputClassName, errors[name] && 'border-red-600 focus:border-red-600'),
  })

  return (
    <form className={cn('grid ', className)} onSubmit={submit} noValidate>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="First Name*" name="firstName" error={errors.firstName}>
          <Input autoComplete="given-name" {...field('firstName')} />
        </Field>
        <Field label="Last Name*" name="lastName" error={errors.lastName}>
          <Input autoComplete="family-name" {...field('lastName')} />
        </Field>
      </div>

      <div className={cn('grid gap-1', layout === 'split' && 'sm:grid-cols-2')}>
        <Field label="Email*" name="email" error={errors.email}>
          <Input type="email" autoComplete="email" {...field('email')} />
        </Field>
        <Field label="Phone*" name="phone" error={errors.phone}>
          <Input type="tel" autoComplete="tel" placeholder="(650) 235-4863" {...field('phone')} />
        </Field>
      </div>

      {services?.length ? (
        <Field label="Service" name="service">
          {/* A native select on purpose: it is one of six fixed choices, it
              has to work on a phone keyboard and with a screen reader, and
              the original site's dropdown is the same control. */}
          <select
            id="lead-service"
            name="service"
            value={serviceSlug}
            onChange={(event) => setServiceSlug(event.target.value)}
            className={cn(
              'w-full appearance-none border border-line bg-white px-4 py-3 text-base text-ink',
              'focus:border-brass focus:outline-none',
              // Room for the chevron drawn by the background image below.
              'bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10',
              inputClassName,
            )}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%2314213D' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")",
            }}
          >
            <option value="">What can we help with?</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label={requireSubject ? 'Subject*' : 'Subject'} name="subject" error={errors.subject}>
        <Input {...field('subject')} />
      </Field>

      <Field label={`${messageLabel}*`} name="message" error={errors.message}>
        <Textarea
          placeholder={messagePlaceholder}
          {...field('message')}
          className={cn(
            inputClassName,
            textareaClassName,
            errors.message && 'border-red-600 focus:border-red-600',
          )}
        />
      </Field>

      {/* Honeypot: hidden from people, irresistible to bots. */}
      <div aria-hidden className="hidden">
        <label htmlFor="lead-company">Company</label>
        <input
          id="lead-company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <Captcha ref={captcha} />

      {formError ? (
        <p role="alert" className="text-sm text-red-600">
          {formError}
        </p>
      ) : null}
      {done ? (
        <p role="status" className="text-sm text-brass-deep">
          Thank you — we have your message and will be in touch shortly.
        </p>
      ) : null}

      <Button
        type="submit"
        variant="primary"
        disabled={sending}
        className={cn('w-fit mt-2', submitClassName)}
      >
        {sending ? 'Sending…' : submitLabel}
      </Button>
    </form>
  )
}

function Field({
  label,
  name,
  error,
  children,
}: {
  label: string
  name: string
  error?: string
  children: React.ReactNode
}) {
  return (
    // `content-start` keeps the rows at their natural height. Without it the
    // wrapper stretches to fill a taller neighbouring cell in the two-column
    // grid, and the extra height lands on the control — so one input grew
    // taller than the one beside it the moment its partner showed an error.
    <div className="grid content-start gap-1 text-sm font-medium text-ink-2">
      <label htmlFor={`lead-${name}`}>{label}</label>
      {children}
      {/*
        The message slot is always in the layout and always the same height, so
        an error appearing or clearing never moves anything. `aria-live` on the
        permanent wrapper means the text is announced when it changes.
      */}
      <div className="min-h-4" aria-live="polite">
        {error ? (
          <p
            id={`lead-${name}-error`}
            role="alert"
            className="text-xs font-normal leading-4 text-red-600"
          >
            {error}
          </p>
        ) : null}
      </div>
    </div>
  )
}
