import 'server-only'

import { isRecaptchaConfigured, verifyRecaptcha, type RecaptchaResult } from './recaptcha'
import { isTurnstileConfigured, verifyTurnstile } from './turnstile'

/**
 * Which captcha the site is running, and the single entry point the contact
 * endpoint calls.
 *
 * Cloudflare Turnstile is the provider in use; reCAPTCHA stays wired as the
 * fallback so removing the Turnstile keys from the environment reverts to the
 * previous behaviour rather than dropping the gate altogether. Exactly one
 * provider is ever consulted, and **the server decides which** — the request
 * body cannot influence it, or a bot could simply name the provider that is
 * not configured and walk through.
 *
 * Both halves of one provider must be set together: `TURNSTILE_SECRET_KEY`
 * with `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, or the reCAPTCHA pair. A site key
 * with no matching secret means the browser renders one widget while the
 * server checks for a different provider's token, and every real submission is
 * rejected.
 */
export type CaptchaResult = RecaptchaResult

export type CaptchaProvider = 'turnstile' | 'recaptcha' | 'none'

export const captchaProvider = (): CaptchaProvider => {
  if (isTurnstileConfigured()) return 'turnstile'
  if (isRecaptchaConfigured()) return 'recaptcha'
  return 'none'
}

export async function verifyCaptcha(
  token: string | undefined,
  remoteIp?: string,
): Promise<CaptchaResult> {
  switch (captchaProvider()) {
    case 'turnstile':
      return verifyTurnstile(token, remoteIp)
    case 'recaptcha':
      return verifyRecaptcha(token, remoteIp)
    default:
      return { status: 'not-configured' }
  }
}
