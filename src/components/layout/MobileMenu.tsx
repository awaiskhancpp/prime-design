'use client'

import { ChevronRight, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import website from '../../../website.json'
import { cn } from '@/lib/utils'

const MOBILE_LINK_LABELS = [
  'Home',
  'About',
  'Services',
  'Projects',
  'Gallery',
  'Resources',
  'Contact',
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)

  const primaryLinks = website.nav.filter(({ label }) => MOBILE_LINK_LABELS.includes(label))

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = ''
      return
    }

    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const toggleSubmenu = (label: string) => {
    setExpanded((current) => (current === label ? null : label))
  }

  return (
    <>
      {/* Menu trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 text-ink-2 lg:hidden"
        aria-label="Open menu"
        aria-expanded={open}
        aria-controls="mobile-navigation"
      >
        <Menu className="h-8 w-8 stroke-[2]" aria-hidden="true" />

        <span className="text-sm font-medium uppercase tracking-[0.08em]">Menu</span>
      </button>

      {/* Mobile navigation */}
      <div
        className={cn(
          'fixed inset-0 z-[100] lg:hidden',
          'pointer-events-none',
          open && 'pointer-events-auto',
        )}
        aria-hidden={!open}
      >
        {/* Dark overlay */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className={cn(
            'absolute inset-0 bg-ink/55',
            'transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
        />

        {/* Drawer */}
        <aside
          id="mobile-navigation"
          className={cn(
            'absolute inset-y-0 left-0',
            'flex w-[80%] max-w-[440px] flex-col',
            'bg-ink text-white',
            'shadow-2xl',
            'transition-transform duration-300 ease-out',
            open ? 'translate-x-0' : '-translate-x-full',
          )}
          aria-label="Mobile navigation"
        >
          {/* Drawer header */}
          <div className="flex min-h-20 items-center justify-end border-b border-white/10 px-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-white/80 transition-colors hover:text-brass"
              aria-label="Close menu"
            >
              <X className="h-7 w-7" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 overflow-y-auto px-5" aria-label="Mobile navigation">
            {primaryLinks.map((item) => {
              const hasChildren = Boolean(item.children?.length)
              const isExpanded = expanded === item.label

              if (!hasChildren) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    tabIndex={open ? 0 : -1}
                    className="flex min-h-[106px] items-center border-b border-white/15 text-[30px] font-normal tracking-tight text-white transition-colors hover:text-brass"
                  >
                    {item.label}
                  </Link>
                )
              }

              return (
                <div key={item.label} className="border-b border-white/15">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.label)}
                    tabIndex={open ? 0 : -1}
                    className="flex min-h-[106px] w-full items-center justify-between text-left text-[30px] font-normal tracking-tight text-white transition-colors hover:text-brass"
                    aria-expanded={isExpanded}
                  >
                    <span>{item.label}</span>

                    <ChevronRight
                      className={cn(
                        'h-7 w-7 text-white/45 transition-transform duration-200',
                        isExpanded && 'rotate-90 text-brass',
                      )}
                      aria-hidden="true"
                    />
                  </button>

                  <div
                    className={cn(
                      'grid transition-[grid-template-rows] duration-300',
                      isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="border-t border-white/10 pb-3">
                        {item.children?.map((child) => (
                          <div key={child.label}>
                            <Link
                              href={child.href}
                              onClick={() => setOpen(false)}
                              tabIndex={open && isExpanded ? 0 : -1}
                              className="flex min-h-14 items-center px-4 text-lg text-white/80 transition-colors hover:text-brass"
                            >
                              {child.label}
                            </Link>

                            {child.children?.length ? (
                              <div className="border-l border-brass/30 ml-4">
                                {child.children.map((nested) => (
                                  <Link
                                    key={nested.label}
                                    href={nested.href}
                                    onClick={() => setOpen(false)}
                                    tabIndex={open && isExpanded ? 0 : -1}
                                    className="flex min-h-12 items-center px-4 text-base text-white/65 transition-colors hover:text-brass"
                                  >
                                    {nested.label}
                                  </Link>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </nav>
        </aside>
      </div>
    </>
  )
}
