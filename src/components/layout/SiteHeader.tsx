import { ChevronDown, ChevronRight } from 'lucide-react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'
import { resolveSiteSettings } from '@/lib/siteSettings'

import { BrandMark } from './BrandMark'

export async function SiteHeader({
  tone = 'dark',
  variant = 'full',
}: {
  tone?: 'dark' | 'light'
  variant?: 'full' | 'minimal'
}) {
  const siteSettings = await resolveSiteSettings()
  const isLight = tone === 'light'
  const isMinimal = variant === 'minimal'
  const primaryLinks = website.nav.filter(({ label }) =>
    ['Home', 'About', 'Services', 'Projects', 'Gallery', 'Resources'].includes(label),
  )

  const linkClassName = isLight ? 'text-ink-2' : 'text-white'

  return (
    <header
      className={cn(
        'absolute inset-x-0 top-0 z-10 border-b',
        isLight ? 'border-line text-ink-2' : 'border-white/20 text-white',
      )}
    >
      <Container className="flex min-h-20 items-center justify-between gap-6">
        <BrandMark linked={!isMinimal} />
        {variant === 'full' ? (
          <nav
            className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.12em] lg:flex"
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
                    {/* Clean SVG chevron replacement with automatic smooth rotation on hover */}
                    <ChevronDown
                      className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180"
                      aria-hidden
                    />
                  </Button>

                  {/* Dropdown Menu - Centered using left-1/2 -translate-x-1/2 */}
                  <div className="invisible absolute left-1/2 top-full z-30 min-w-56 -translate-x-1/2 translate-y-2 border border-line bg-white py-2 opacity-0 shadow-lg transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {item.children.map((child) => (
                      <div key={child.label} className="group/sub relative">
                        <a
                          href={child.href}
                          className="flex items-center justify-between gap-5 px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass"
                        >
                          {child.label}
                          {child.children?.length ? (
                            <ChevronRight className="h-4 w-4 text-ink-2/60" aria-hidden />
                          ) : null}
                        </a>
                        {child.children?.length ? (
                          <div className="invisible absolute left-full top-0 z-30 min-w-56 border border-line bg-white py-2 opacity-0 shadow-lg transition duration-200 group-hover/sub:visible group-hover/sub:opacity-100">
                            {child.children.map((nested) => (
                              <a
                                key={nested.label}
                                href={nested.href}
                                className="block px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass"
                              >
                                {nested.label}
                              </a>
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
          <div className="hidden text-right xl:block">
            <a
              href={`tel:${siteSettings.phoneClean}`}
              className={cn(
                'text-sm font-semibold tracking-wide transition-colors hover:text-brass',
                isLight ? 'text-ink-2' : 'text-white',
              )}
            >
              {siteSettings.phone}
            </a>
          </div>
          <Button
            href={isMinimal ? '#contact' : '/contact'}
            size="lg"
            variant={isLight ? 'outline' : 'outline-light'}
          >
            {isMinimal ? 'Get A Quote' : 'Contact'}
          </Button>
        </div>
      </Container>
    </header>
  )
}
