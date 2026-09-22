import 'server-only'

/**
 * Cloudflare Turnstile verification.
 *
 * Mirrors `lib/recaptcha.ts` deliberately — same result shape, same
 * "inert until the secret exists, enforcing the moment it does" contract — so
 * `lib/captcha.ts` can pick between the two providers without the endpoint or
 * the forms caring which one answered.
 *
 * Turnstile has no score: `success` alone decides, so `score` is never set and
 * there is no threshold to configure.
 */
const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileResult = {
  status: 'not-configured' | 'verified' | 'skipped'
  /** Set when the check ran and failed — the endpoint turns this into a 400. */
  error?: string
}

export const isTurnstileConfigured = () => Boolean(process.env.TURNSTILE_SECRET_KEY)

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY
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
      'error-codes'?: string[]
    }

    if (!result.success) {
      return { status: 'skipped', error: 'Captcha verification failed. Please try again.' }
    }

    return { status: 'verified' }
  } catch {
    // Same reasoning as the reCAPTCHA module: a network failure on
    // Cloudflare's side must not let spam through silently, but it must not
    // lose a real lead either. Soft failure — the submission is stored and
    // recorded as `skipped`.
    return { status: 'skipped', error: undefined }
  }
}
