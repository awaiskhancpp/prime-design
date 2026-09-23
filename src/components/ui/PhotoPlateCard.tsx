import type { ReactNode } from 'react'
import Image from '@/components/ui/Image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * A photograph on a paper plate — the card used by the projects grid and by
 * the landing pages' craftsmanship section.
 *
 * The photograph is kept whole and a plate the full width of the card sits
 * under it, in `paper` rather than white, opened by a brass rule. There is no
 * border: the warm plate is what separates the copy from the page, and the
 * rule is the only drawn line. That is deliberately neither of the site's
 * other two card idioms — the services cards are white boxes with a hairline
 * drawn all the way round, and the homepage project tiles lay their copy over
 * a gradient on the photograph itself.
 *
 * Everything below the title is optional, because the two callers do not carry
 * the same fields. A project has a category, a place and somewhere to go; a
 * craftsmanship item has a title and two paragraphs and nothing else. Rather
 * than invent a category and a link for the second one, the label and the
 * footer simply do not render — an empty brass line and a footer with one
 * blank side would look like a fault, and a fabricated one would be worse.
 */
export function PhotoPlateCard({
  image,
  imageAlt = '',
  aspect = 'aspect-[3/2]',
  eyebrow,
  title,
  titleAs: Title = 'h2',
  children,
  footerLeft,
  actionLabel,
  href,
  priority,
  sizes = '(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw',
  className,
}: {
  image?: string
  imageAlt?: string
  /** The photograph's frame. 3:2 by default — wider than either other card. */
  aspect?: string
  eyebrow?: string
  title: string
  titleAs?: 'h2' | 'h3'
  /** The body copy. The caller owns its clamping, which differs by content. */
  children?: ReactNode
  footerLeft?: string
  actionLabel?: string
  /** Wraps the whole card when present; without one it is not a link at all. */
  href?: string
  priority?: boolean
  sizes?: string
  className?: string
}) {
  const hasFooter = Boolean(footerLeft || actionLabel)

  const body = (
    <>
      {image ? (
        <div className={cn('relative overflow-hidden bg-ink', aspect)}>
          <Image
            src={image}
            alt={imageAlt}
            fill
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes={sizes}
          />
        </div>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col bg-paper p-5 transition-colors duration-300 group-hover:bg-paper-2">
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-0.5 bg-brass transition-colors duration-300 group-hover:bg-brass-deep"
        />

        {eyebrow ? (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-brass-deep">
            {eyebrow}
          </p>
        ) : null}

        <Title
          className={cn(
            'line-clamp-2 font-display text-xl font-medium leading-tight text-ink transition-colors group-hover:text-brass-deep',
            eyebrow && 'mt-2',
          )}
        >
          {title}
        </Title>

        {children}

        {hasFooter ? (
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-ink-2/10 pt-3.5">
            <span className="min-w-0 truncate text-[11px] font-medium text-ink-2/50">
              {footerLeft}
            </span>
            {actionLabel ? (
              <span className="flex shrink-0 items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                {actionLabel}
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1"
                  aria-hidden
                />
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </>
  )

  if (!href) {
    return <article className={cn('group flex h-full flex-col', className)}>{body}</article>
  }

  return (
    <article className={cn('group h-full', className)}>
      <Link
        href={href}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-4"
      >
        {body}
      </Link>
    </article>
  )
}
