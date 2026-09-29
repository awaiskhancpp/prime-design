/** Cloudflare Turnstile site keys use this prefix and cannot be sent to Google reCAPTCHA. */
export const isTurnstileKey = (value: string | undefined | null): boolean =>
  value?.trim().startsWith('0x4AAAA') ?? false
