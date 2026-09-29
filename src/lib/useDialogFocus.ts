'use client'

import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function focusableIn(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    (element) => !element.closest('[inert]') && element.getClientRects().length > 0,
  )
}

/**
 * Keyboard behaviour for a modal dialog, in one place so every dialog on the
 * site gets all of it rather than whichever part its author remembered:
 *
 * - **Initial focus** — on open, focus moves to the dialog container itself
 *   (give it `tabIndex={-1}`), so a screen reader announces the dialog's
 *   label before anything inside it. Tab then reaches the first control.
 * - **Trap** — Tab and Shift+Tab wrap inside the dialog; focus can no longer
 *   walk out into the page behind it.
 * - **Escape** closes it.
 * - **Restore** — on close, focus returns to whatever had it before the
 *   dialog opened (normally the button that opened it), so a keyboard user
 *   is not dropped back at the top of the page.
 *
 * `onClose` is read through a ref, so passing an inline arrow does not
 * re-run the effect (and re-steal focus) on every render.
 */
export function useDialogFocus(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const frame = requestAnimationFrame(() => {
      const container = ref.current
      if (container && !container.contains(document.activeElement)) {
        container.focus({ preventScroll: true })
      }
    })

    const onKeyDown = (event: KeyboardEvent) => {
      const container = ref.current
      if (!container) return

      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return

      const items = focusableIn(container)
      if (!items.length) {
        event.preventDefault()
        container.focus({ preventScroll: true })
        return
      }
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement
      const outside = !(active instanceof Node) || !container.contains(active)

      if (event.shiftKey && (active === first || active === container || outside)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (active === last || outside)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
      if (previous && previous.isConnected) previous.focus({ preventScroll: true })
    }
  }, [open, ref])
}
