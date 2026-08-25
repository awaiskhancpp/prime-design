import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { cn } from '@/lib/utils'

import { BrandMark } from './BrandMark'

export function SiteHeader({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const isLight = tone === 'light'
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
        <BrandMark />
        <nav
          className="hidden items-center gap-6 text-xs font-medium uppercase tracking-[0.12em] lg:flex"
          aria-label="Primary navigation"
        >
          {primaryLinks.map((item) => {
            if (!item.children?.length) {
              return (
                <Button key={item.label} href={item.href} variant="line" className={linkClassName}>
                  {item.label}
                </Button>
              )
            }

            return (
              <div key={item.label} className="group relative">
                <Button href={item.href === '#' ? undefined : item.href} variant="line" className={linkClassName}>
                  {item.label}
                  <span aria-hidden="true" className="text-base leading-none">⌄</span>
                </Button>
                <div className="invisible absolute left-0 top-full z-30 min-w-56 translate-y-2 border border-line bg-white py-2 opacity-0 shadow-lg transition duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.children.map((child) => (
                    <div key={child.label} className="group/sub relative">
                      <a href={child.href} className="flex items-center justify-between gap-5 px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass">
                        {child.label}
                        {child.children?.length ? <span aria-hidden="true" className="text-base leading-none">›</span> : null}
                      </a>
                      {child.children?.length ? (
                        <div className="invisible absolute left-full top-0 z-30 min-w-56 border border-line bg-white py-2 opacity-0 shadow-lg transition duration-200 group-hover/sub:visible group-hover/sub:opacity-100">
                          {child.children.map((nested) => (
                            <a key={nested.label} href={nested.href} className="block px-5 py-2 text-sm font-medium normal-case tracking-normal text-ink-2 transition-colors hover:bg-paper-2 hover:text-brass">
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
        <div className="flex items-center gap-5">
          <a
            href={`tel:${website.header.phoneCta.replace(/[^\d+]/g, '')}`}
            className={cn(
              'hidden text-sm font-semibold tracking-wide transition-colors hover:text-brass xl:block',
              isLight ? 'text-ink-2' : 'text-white',
            )}
          >
            {website.header.phoneCta}
          </a>
          <Button href="/contact" size="lg" variant={isLight ? 'outline' : 'outline-light'}>
            Talk to an expert
          </Button>
        </div>
      </Container>
    </header>
  )
}
