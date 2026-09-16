/**
 * Shared form validation.
 *
 * Every lead form on the site (the contact page, the appointment modal, the
 * service-location hero form) collects the same handful of field types, so the
 * rules live here once rather than being re-implemented per form. Each
 * validator returns an error message, or `undefined` when the value is valid.
 */

export type Validator = (value: string) => string | undefined

/** Digits only, so "(650) 235-4863" and "650-235-4863" compare equal. */
const digitsOf = (value: string) => value.replace(/\D/g, '')

export const required =
  (label: string): Validator =>
  (value) =>
    value.trim() ? undefined : `${label} is required.`

export const minLength =
  (label: string, min: number): Validator =>
  (value) =>
    value.trim().length >= min ? undefined : `${label} must be at least ${min} characters.`

/**
 * A person's name: at least two characters and no digits. Deliberately loose —
 * names contain apostrophes, hyphens, accents and spaces.
 */
export const personName =
  (label: string): Validator =>
  (value) => {
    const trimmed = value.trim()
    if (!trimmed) return `${label} is required.`
    if (trimmed.length < 2) return `${label} must be at least 2 characters.`
    if (/\d/.test(trimmed)) return `${label} cannot contain numbers.`
    return undefined
  }

/**
 * Email. Not the full RFC grammar — that rejects addresses people really use —
 * but enough to catch the mistakes that actually happen: a missing @, a missing
 * domain, a missing TLD, spaces, or a trailing dot.
 */
export const email: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Email is required.'
  if (/\s/.test(trimmed)) return 'Email cannot contain spaces.'
  if (!/^[^@]+@[^@]+$/.test(trimmed)) return 'Enter a valid email address.'
  const [, domain] = trimmed.split('@')
  if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain)) return 'Enter a valid email address.'
  if (domain.includes('..') || domain.startsWith('-') || domain.endsWith('-'))
    return 'Enter a valid email address.'
  return undefined
}

/**
 * A US phone number, checked against the North American Numbering Plan rather
 * than just counting digits:
 *   - 10 digits, or 11 with a leading country code 1
 *   - the area code and the exchange code both start 2-9
 *   - N11 area codes (411, 911, ...) are service codes, not subscriber numbers
 *   - 555-01xx is the reserved fictional range
 */
export const usPhone: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Phone number is required.'
  let digits = digitsOf(trimmed)
  if (digits.length === 11 && digits.startsWith('1')) digits = digits.slice(1)
  if (digits.length !== 10) return 'Enter a 10-digit US phone number.'

  const area = digits.slice(0, 3)
  const exchange = digits.slice(3, 6)
  if (area[0] === '0' || area[0] === '1') return 'Area code cannot start with 0 or 1.'
  if (area[1] === '1' && area[2] === '1') return `${area} is a service code, not an area code.`
  if (exchange[0] === '0' || exchange[0] === '1')
    return 'Phone number is not a valid US number.'
  if (exchange === '555' && digits.slice(6, 8) === '01')
    return 'Enter a real phone number.'
  return undefined
}

/** A US ZIP code: five digits, optionally followed by a four-digit ZIP+4. */
export const usZip: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'ZIP code is required.'
  if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return 'Enter a valid US ZIP code, e.g. 94086.'
  if (/^0{5}/.test(trimmed)) return 'Enter a valid US ZIP code, e.g. 94086.'
  return undefined
}

/** Counts whitespace-separated words, so a one-word "hi" is rejected. */
export const wordCount = (value: string) => value.trim().split(/\s+/).filter(Boolean).length

/**
 * A message long enough to be useful. The contact forms ask for at least eight
 * words so the team gets something they can actually respond to.
 */
export const minWords =
  (label: string, min: number): Validator =>
  (value) => {
    const trimmed = value.trim()
    if (!trimmed) return `${label} is required.`
    const words = wordCount(trimmed)
    if (words < min)
      return `${label} must be at least ${min} words — you have ${words}.`
    return undefined
  }

/** A street address: a number and a street name at minimum. */
export const streetAddress: Validator = (value) => {
  const trimmed = value.trim()
  if (!trimmed) return 'Address is required.'
  if (trimmed.length < 5) return 'Enter your full street address.'
  if (!/\d/.test(trimmed)) return 'Address should include a street number.'
  if (wordCount(trimmed) < 2) return 'Enter your full street address.'
  return undefined
}

/** Optional field: only runs the validator when the value is non-empty. */
export const optional =
  (validator: Validator): Validator =>
  (value) =>
    value.trim() ? validator(value) : undefined

export type FieldRules<Name extends string> = Partial<Record<Name, Validator>>

/** Runs every rule and returns the errors keyed by field name. */
export function validateFields<Name extends string>(
  values: Record<Name, string>,
  rules: FieldRules<Name>,
): Partial<Record<Name, string>> {
  const errors: Partial<Record<Name, string>> = {}
  for (const key of Object.keys(rules) as Name[]) {
    const validator = rules[key]
    if (!validator) continue
    const message = validator(values[key] ?? '')
    if (message) errors[key] = message
  }
  return errors
}
