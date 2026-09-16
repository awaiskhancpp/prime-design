import 'server-only'

/**
 * reCAPTCHA verification.
 *
 * The keys are not available yet, so this is wired end to end but inert: with
 * no `RECAPTCHA_SECRET_KEY` set, `verifyRecaptcha` reports `not-configured`
 * and the endpoint accepts the submission. The moment the key is added to the
 * environment the same call starts enforcing, and a missing or invalid token
 * is rejected — no code change, no form change.
 *
 * Supports both widget versions:
 *   v2 checkbox  the response has no score; success alone decides.
 *   v3           the response carries a score; `RECAPTCHA_MIN_SCORE`
 *                (default 0.5, the threshold the WordPress form used) decides.
 */
const VERIFY_URL = 'https://www.google.com/recaptcha/api/siteverify'

export type RecaptchaResult = {
  status: 'not-configured' | 'verified' | 'skipped'
  score?: number
  /** Set when the check ran and failed — the endpoint turns this into a 400. */
  error?: string
}

export const isRecaptchaConfigured = () => Boolean(process.env.RECAPTCHA_SECRET_KEY)

export async function verifyRecaptcha(
  token: string | undefined,
  remoteIp?: string,
): Promise<RecaptchaResult> {
  const secret = process.env.RECAPTCHA_SECRET_KEY
  if (!secret) return { status: 'not-configured' }

  if (!token) return { status: 'skipped', error: 'Captcha verification is required.' }

  try {
    const body = new URLSearchParams({ secret, response: token })
    if (remoteIp) body.set('remoteip', remoteIp)

    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })
    const result = (await response.json()) as {
      success?: boolean
      score?: number
      'error-codes'?: string[]
    }

    if (!result.success) {
      return { status: 'skipped', error: 'Captcha verification failed. Please try again.' }
    }

    // v3 only: enforce the score threshold.
    if (typeof result.score === 'number') {
      const min = Number(process.env.RECAPTCHA_MIN_SCORE ?? '0.5')
      if (result.score < min) {
        return {
          status: 'skipped',
          score: result.score,
          error: 'Captcha verification failed. Please try again.',
        }
      }
      return { status: 'verified', score: result.score }
    }

    return { status: 'verified' }
  } catch {
    // A network failure on Google's side must not silently let spam through,
    // but it must not lose a real lead either — the endpoint treats this as a
    // soft failure and records `skipped` on the stored submission.
    return { status: 'skipped', error: undefined }
  }
}
