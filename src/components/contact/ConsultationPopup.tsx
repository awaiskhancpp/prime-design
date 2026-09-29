'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'

import { LeadForm } from '@/components/forms/LeadForm'
import type { FormServiceOption } from '@/lib/formServices'
import { useDialogFocus } from '@/lib/useDialogFocus'

/** How long after the page mounts the popup appears. */
const OPEN_DELAY_MS = 4000

/**
 * Marks the popup as already shown for this browser tab/session, so
 * navigating around the site — or reloading the same page — does not show it
 * again and again. A fresh session (new tab, browser restart) sees it once
 * more.
 */
const SESSION_KEY = 'consultation-popup-shown'

/**
 * Site-wide "Schedule a Consultation" popup.
 *
 * Mechanism, in full, so it is never a mystery again:
 *
 *   1. On mount, check `sessionStorage[SESSION_KEY]`. If it's already set,
 *      this tab has already been shown the popup this session — do nothing,
 *      ever, for the rest of this page's life.
 *   2. Otherwise, arm a plain `setTimeout` for `OPEN_DELAY_MS`.
 *   3. When the timer actually fires, THAT is the moment the popup opens
 *      AND the moment `sessionStorage[SESSION_KEY]` gets written. Marking
 *      "shown" only at fire time, not at mount/arm time, is deliberate: it
 *      is also what makes this safe under React's development-only Strict
 *      Mode, which mounts every component, cleans it up, and mounts it
 *      again once, specifically to catch effects with side effects that
 *      don't tolerate that. An earlier version of this wrote the flag as
 *      soon as the timer was armed — so the throwaway first mount wrote
 *      "shown", its cleanup cancelled that mount's timer as expected, and
 *      the second (real, lasting) mount then read "already shown" and never
 *      armed a replacement timer at all. The popup silently never opened,
 *      in development only — exactly the "I don't know its mechanism"
 *      symptom this was built to avoid. Writing at fire time means both the
 *      throwaway and the real mount read the same unwritten flag and reach
 *      the same decision; only the one timer that actually survives to
 *      fire ever writes anything.
 *   4. Closing it (X, backdrop click, or Escape) before it would have fired
 *      leaves the flag unwritten, so the next page load in this session
 *      tries again — closing it after it opened does not re-arm anything,
 *      since the flag is already set by then.
 *
 * Mounted once in `template.tsx`, in the branch every normal page gets — it
 * is intentionally absent from Google Ads landing pages and service-location
 * pages (the `bare` branch), which are single-purpose conversion pages that
 * already lead straight to their own booking section.
 *
 * `sessionStorage` (not `localStorage`) is deliberate: a return visitor in a
 * new tab tomorrow is a new opportunity to ask, not someone to keep
 * suppressing forever.
 */
export function ConsultationPopup({ services }: { services?: FormServiceOption[] }) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  useDialogFocus(dialogRef, open, () => setOpen(false))

  useEffect(() => {
    let alreadyShown = false
    try {
      alreadyShown = sessionStorage.getItem(SESSION_KEY) === 'true'
    } catch {
      // Private browsing / storage disabled: fail open rather than throw —
      // worst case the popup can show more than once per visit.
    }
    if (alreadyShown) return

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, 'true')
      } catch {
        // Same fail-open reasoning as above.
      }
      setOpen(true)
    }, OPEN_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!open) return null

  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 p-4 outline-none animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Schedule a consultation"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <div className="relative w-full max-w-lg border border-line bg-white shadow-xl">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center text-ink transition-colors hover:text-brass"
          aria-label="Close"
        >
          <X className="h-5 w-5" strokeWidth={2.25} aria-hidden />
        </button>

        <div className="max-h-[calc(100vh-2rem)] overflow-y-auto px-8 py-10 sm:px-10">
          <h2 className="text-center font-display text-2xl font-semibold text-ink md:text-3xl">
            Free Consultation
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-center text-sm leading-6 text-ink-2/65">
            Tell us a bit about your project and we&apos;ll be in touch to set up your free
            consultation.
          </p>

          <LeadForm
            className="mt-6 gap-1"
            layout="stacked"
            submitLabel="Contact Us"
            submitClassName="w-full"
            messagePlaceholder="Tell us about your project..."
            formName="Consultation popup"
            source="other"
            services={services}
          />
        </div>
      </div>
    </div>
  )
}
