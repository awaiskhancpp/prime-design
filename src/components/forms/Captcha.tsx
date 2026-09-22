'use client'

import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'

import { cn } from '@/lib/utils'
import { Recaptcha } from './Recaptcha'

/**
 * The captcha widget the lead forms render.
 *
 * Cloudflare Turnstile when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set, the
 * existing reCAPTCHA v2 checkbox when only the reCAPTCHA key is, and nothing
 * at all when neither is — the forms keep working in every case, and the
 * server-side counterpart (`lib/captcha.ts`) picks its provider the same way.
 *
 * The handle is imperative on purpose. A Turnstile token is **single-use** and
 * expires after roughly five minutes, so holding one in React state and
 * posting it later is the classic way to send a dead token: the form reads the
 * token at the moment it submits (`getToken`) and resets the widget afterwards
 * — after a failure too, since a rejected token is spent either way.
 */
export type CaptchaHandle = {
  /** The current token, read at submit time. `undefined` if unsolved. */
  getToken: () => string | undefined
  /** Discard the current token and re-arm the widget. */
  reset: () => void
}

/** Turnstile's natural size at `size: 'normal'`. */
const WIDGET_WIDTH = 300
const WIDGET_HEIGHT = 65

const turnstileSiteKey = () => process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const recaptchaSiteKey = () => process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

/** Whether a widget will render — forms use this to require a token. */
export const captchaEnabled = () => Boolean(turnstileSiteKey() || recaptchaSiteKey())

export function Captcha({
  ref,
  className,
  /** Every form that renders this sits on white; `auto` would go dark on a
   *  dark-mode OS and look wrong against the paper background. */
  theme = 'light',
}: {
  ref?: Ref<CaptchaHandle>
  className?: string
  theme?: 'light' | 'dark' | 'auto'
}) {
  const siteKey = turnstileSiteKey()
  const widget = useRef<TurnstileInstance>(null)
  // Only used by the reCAPTCHA branch, whose widget reports its token through a
  // callback rather than an imperative getter.
  const [recaptchaToken, setRecaptchaToken] = useState<string>()

  // The widget renders at its own 300x65 and is left where it lands — it is a
  // third-party control with its own internal layout, not a form field, so
  // stretching it across the form only made it look like one.
  //
  // It still has to be scaled down on a phone, where the form column is
  // narrower than 300px (237px at a 320px viewport) and the widget would
  // otherwise be clipped. Scaling rather than switching to the `compact` size
  // on a breakpoint is deliberate: changing a render option re-mounts the
  // widget, which would throw away a token the person had already earned if
  // they so much as rotated the device.
  const column = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  useEffect(() => {
    const element = column.current
    if (!element || !siteKey) return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      setScale(width >= WIDGET_WIDTH ? 1 : Math.max(width / WIDGET_WIDTH, 0.6))
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [siteKey])

  useImperativeHandle(
    ref,
    () => ({
      getToken: () => (siteKey ? widget.current?.getResponse() : recaptchaToken),
      reset: () => {
        if (siteKey) widget.current?.reset()
        else setRecaptchaToken(undefined)
      },
    }),
    [siteKey, recaptchaToken],
  )

  if (!siteKey) return <Recaptcha onToken={setRecaptchaToken} />

  return (
    <div
      ref={column}
      // `min-w-0` matters: without it this grid item's 300px width widens the
      // whole form on a phone instead of the widget scaling down inside it.
      // `mt-1` keeps the placement the reCAPTCHA widget had; `mb-3` matches the
      // 12px error-message slot the fields above space themselves with.
      className={cn('mt-1 mb-3 min-w-0', className)}
      // A transform does not shrink the space the element reserves, so the
      // scaled-off height is taken back here — otherwise a gap opens between
      // the widget and the submit button on phones.
      style={scale < 1 ? { height: WIDGET_HEIGHT * scale } : undefined}
    >
      <div
        style={
          scale < 1
            ? { width: WIDGET_WIDTH, transform: `scale(${scale})`, transformOrigin: 'left top' }
            : undefined
        }
      >
        <Turnstile
          ref={widget}
          siteKey={siteKey}
          // `normal` is Turnstile's own 300x65. Not `flexible`, which stretches
          // the widget to whatever width it is given — across a full-width form
          // that blew it up into a wide grey band.
          options={{ theme, size: 'normal' }}
          // A token that expires while the form is still open silently becomes
          // unusable; fetch a fresh one rather than let the person discover it
          // when they submit.
          onExpire={() => widget.current?.reset()}
        />
      </div>
    </div>
  )
}
