'use client'

import { ChevronDown, ChevronRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

import { BrandMark } from './BrandMark'

// Client component (mobile drawer state); server data arrives via props.

export function SiteHeader({
  tone = 'dark',
  variant = 'full',
}: {
  tone?: 'dark' | 'light'
  variant?: 'full' | 'minimal'
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isLight = tone === 'light'
  const isMinimal = variant === 'minimal'

  const primaryLinks = website.nav.filter(({ label }) =>
    ['Home', 'About', 'Services', 'Projects', 'Gallery', 'Resources'].includes(label),
  )

  const linkClassName = isLight ? 'text-ink-2' : 'text-white'

  return (
    <>
      <header
        className={cn(
          'absolute inset-x-0 top-0 z-40 border-b transition-colors duration-200',

          // Mobile and tablet: transparent
          'border-white/10 bg-transparent text-white',

          // Desktop tone
          isLight ? 'lg:border-line lg:text-ink-2' : 'lg:border-white/20 lg:text-white',
        )}
      >
        {/* =========================
            MOBILE + TABLET HEADER
        ========================= */}
        <div className="lg:hidden">
          <Container>
            {/* This bar is always an overlay on a photo/video background
                (the base header classes above are bg-transparent text-white
                regardless of tone), so its contents are always white — not
                tone-dependent like the desktop bar below. */}
            <div className="relative flex min-h-[84px] items-center justify-between py-3">
              {/* LEFT — MENU */}
              <button
                type="button"
                onClick={() => setIsMenuOpen(true)}
                className="relative z-10 flex items-center gap-2.5 text-white"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className="h-7 w-7 stroke-[2]" />
                <span className="text-xs font-semibold uppercase tracking-[0.18em]">Menu</span>
              </button>

              {/* CENTER — LOGO */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <BrandMark linked={!isMinimal} />
              </div>

              {/* RIGHT — REQUEST A QUOTE */}
              <Link
                href={isMinimal ? '#contact' : '/contact'}
                className="relative z-10 flex shrink-0 flex-col items-center gap-1 text-white transition-colors hover:text-brass"
                aria-label="Request a quote"
              >
                <Image
                  src="/request-a-quote.svg"
                  alt=""
                  width={30}
                  height={30}
                  className="h-[30px] w-[30px]"
                />
                <span className="text-center text-[9px] font-semibold uppercase leading-tight tracking-[0.08em]">
                  Request a
                  <br />
                  Quote
                </span>
              </Link>
            </div>
          </Container>
        </div>

        {/* =========================
            DESKTOP HEADER
        ========================= */}
        <div className="hidden lg:block">
          <Container className="flex min-h-20 items-center justify-between gap-6">
            <BrandMark linked={!isMinimal} />

            {variant === 'full' ? (
              <nav
                className="flex items-center gap-6 text-xs font-medium uppercase tracking-[0.12em]"
                aria-label="Primary navigation"
              >
                {primaryLinks.map((item) => {
                  if (!item.children?.length) {
                    return (
                      <Button
                        key={item.label}
                        href={item.href}
                        variant="line"
                        className={linkClassName}
                      >
                        {item.label}
                      </Button>
                    )
                  }

                  return (
                    <div key={item.label} className="group relative">
                      <Button
                        href={item.href === '#' ? undefined : item.href}
                        variant="line"
                        className={linkClassName}
                      >
                        {item.label}

                        <ChevronDown
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                          aria-hidden="true"
                        />
                      </Button>

                      <div className="invisible absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 translate-y-2 border border-line bg-white py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                        {item.children.map((child) => (
                          <div key={child.label} className="group/sub relative">
                            <Link
                              href={child.href}
                              className="flex items-center justify-between gap-5 px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass"
                            >
                              {child.label}

                              {child.children?.length ? (
                                <ChevronRight
                                  className="h-4 w-4 text-ink-2/60"
                                  aria-hidden="true"
                                />
                              ) : null}
                            </Link>

                            {child.children?.length ? (
                              <div className="invisible absolute left-full top-0 z-50 min-w-56 border border-line bg-white py-2 opacity-0 shadow-lg transition duration-200 group-hover/sub:visible group-hover/sub:opacity-100">
                                {child.children.map((nested) => (
                                  <Link
                                    key={nested.label}
                                    href={nested.href}
                                    className="block px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass"
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
                  )
                })}
              </nav>
            ) : null}

            <div className="flex items-center gap-5">
              <DesktopPhone tone={tone} />

              <Button
                href={isMinimal ? '#contact' : '/contact'}
                size="lg"
                variant={isLight ? 'outline' : 'outline-light'}
              >
                {isMinimal ? 'Get A Quote' : 'Contact'}
              </Button>
            </div>
          </Container>
        </div>
      </header>

      {/* =========================
          MOBILE MENU DRAWER
      ========================= */}
      <div
        className={cn(
          'fixed inset-0 z-[100] lg:hidden',
          isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setIsMenuOpen(false)}
          className={cn(
            'absolute inset-0 bg-black/40 transition-opacity duration-300',
            isMenuOpen ? 'opacity-100' : 'opacity-0',
          )}
        />

        {/* Drawer */}
        <aside
          className={cn(
            'absolute left-0 top-0 flex h-full w-[min(80vw,423px)] flex-col bg-[#29344F] shadow-2xl transition-transform duration-300 ease-out',
            isMenuOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          {/* Close button */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/60">
              Navigation
            </span>

            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="flex h-10 w-10 items-center justify-center text-white transition-colors hover:text-brass"
              aria-label="Close navigation menu"
            >
              <X className="h-7 w-7" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-1 flex-col overflow-y-auto px-5">
            {primaryLinks.map((item) => (
              <div key={item.label} className="border-b border-white/15">
                <Link
                  href={item.href === '#' ? '/' : item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex min-h-[104px] items-center justify-between text-[28px] font-medium tracking-tight text-white transition-colors hover:text-brass"
                >
                  {item.label}

                  {item.children?.length ? (
                    <ChevronRight className="h-7 w-7 text-white/50" aria-hidden="true" />
                  ) : null}
                </Link>
              </div>
            ))}

            <div className="border-b border-white/15">
              <Link
                href="/contact"
                onClick={() => setIsMenuOpen(false)}
                className="flex min-h-[104px] items-center text-[28px] font-medium tracking-tight text-white transition-colors hover:text-brass"
              >
                Contact
              </Link>
            </div>
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-white/10 p-5">
            <Link
              href="/contact"
              onClick={() => setIsMenuOpen(false)}
              className="flex min-h-14 items-center justify-center border border-brass bg-brass px-6 text-sm font-semibold uppercase tracking-[0.14em] text-ink-2 transition-opacity hover:opacity-90"
            >
              Request a Quote
            </Link>
          </div>
        </aside>
      </div>
    </>
  )
}

/* =========================
   DESKTOP PHONE
========================= */

function DesktopPhone({ tone }: { tone: 'dark' | 'light' }) {
  // Static phone (same value the CMS site-settings resolves to) — the header
  // is a client component and must not import the server-only Payload config.
  const phone = website.footer.phone
  const phoneClean = phone.replace(/[^\d+]/g, '')
  const isLight = tone === 'light'

  return (
    <div className="hidden text-right xl:block">
      <a
        href={`tel:${phoneClean}`}
        className={cn(
          'text-sm font-semibold tracking-wide transition-colors hover:text-brass',
          isLight ? 'text-ink-2' : 'text-white',
        )}
      >
        {phone}
      </a>
    </div>
  )
}
