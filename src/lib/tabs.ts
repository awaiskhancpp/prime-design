import type { KeyboardEvent } from 'react'

/**
 * ARIA wiring for the site's tab rows, which all share one shape: a
 * `role="tablist"` of buttons above a single area that shows the selected
 * tab's content. Spread `tabProps` on each tab button and `tabPanelProps` on
 * that area, with the same `base` (from `useId()`), so the two reference each
 * other — `aria-controls` on the tabs, `aria-labelledby` on the panel.
 *
 * Keyboard follows the WAI-ARIA tabs pattern with automatic activation: only
 * the selected tab is in the Tab order, and the arrow keys (plus Home/End)
 * move along the row, selecting as they go.
 */

function tabId(base: string, key: string | number) {
  return `${base}-tab-${String(key).replace(/[^\w-]/g, '-')}`
}

function panelId(base: string) {
  return `${base}-panel`
}

function onTabKeyDown(event: KeyboardEvent<HTMLElement>) {
  const list = event.currentTarget.closest('[role="tablist"]')
  if (!list) return
  const tabs = Array.from(list.querySelectorAll<HTMLElement>('[role="tab"]'))
  const current = tabs.indexOf(event.currentTarget)
  if (current < 0) return

  let next: number
  switch (event.key) {
    case 'ArrowRight':
    case 'ArrowDown':
      next = (current + 1) % tabs.length
      break
    case 'ArrowLeft':
    case 'ArrowUp':
      next = (current - 1 + tabs.length) % tabs.length
      break
    case 'Home':
      next = 0
      break
    case 'End':
      next = tabs.length - 1
      break
    default:
      return
  }
  event.preventDefault()
  tabs[next].focus()
  tabs[next].click()
}

export function tabProps(base: string, key: string | number, selected: boolean) {
  return {
    id: tabId(base, key),
    role: 'tab' as const,
    'aria-selected': selected,
    'aria-controls': panelId(base),
    tabIndex: selected ? 0 : -1,
    onKeyDown: onTabKeyDown,
  }
}

export function tabPanelProps(base: string, selectedKey: string | number) {
  return {
    id: panelId(base),
    role: 'tabpanel' as const,
    'aria-labelledby': tabId(base, selectedKey),
  }
}
