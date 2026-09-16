'use client'

import { useEffect, useRef } from 'react'

/**
 * reCAPTCHA v2 checkbox.
 *
 * The keys are not available yet, so this renders nothing and reports no token
 * while `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` is unset — the forms keep working and
 * the endpoint (which is inert on the server side too) accepts them. Adding the
 * site key to the environment is all it takes to make the widget appear; no
 * form or endpoint change is needed.
 *
 * Google's script is loaded lazily, only when a key exists, so no third-party
 * request is made until the site actually uses it.
 */
declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement,
        options: { sitekey: string; callback: (token: string) => void; 'expired-callback': () => void },
      ) => number
      reset: (widgetId?: number) => void
    }
    onRecaptchaLoaded?: () => void
  }
}

const SCRIPT_ID = 'recaptcha-v2-script'

export function Recaptcha({ onToken }: { onToken: (token: string | undefined) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const container = useRef<HTMLDivElement | null>(null)
  const widgetId = useRef<number | null>(null)

  useEffect(() => {
    if (!siteKey) return
    let cancelled = false

    // Rendering the widget IS the external-system sync, so it happens straight
    // from the effect — there is no React state to keep in step.
    const renderWidget = () => {
      if (cancelled || !container.current || widgetId.current !== null) return
      if (!window.grecaptcha) return
      widgetId.current = window.grecaptcha.render(container.current, {
        sitekey: siteKey,
        callback: (token) => onToken(token),
        'expired-callback': () => onToken(undefined),
      })
    }

    if (window.grecaptcha) {
      renderWidget()
      return () => {
        cancelled = true
      }
    }

    window.onRecaptchaLoaded = renderWidget
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = SCRIPT_ID
      script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=onRecaptchaLoaded'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    return () => {
      cancelled = true
    }
  }, [siteKey, onToken])

  if (!siteKey) return null
  return <div ref={container} className="mt-1" />
}

/** Whether the widget will render — forms use this to require a token. */
export const recaptchaEnabled = () => Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY)
