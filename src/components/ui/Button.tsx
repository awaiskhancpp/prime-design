import {
  Children,
  cloneElement,
  isValidElement,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'
import Link from 'next/link'

import { cva, type VariantProps } from 'class-variance-authority'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * The site's button system.
 *
 * Labels are set uppercase with open tracking, which is the brand's existing
 * language for small text — `SectionHeader`'s eyebrow, the stat labels under
 * the Silicon Valley Loves image, and the `line` variant below all already
 * read that way. The casing is CSS only, so CMS-authored labels stay as the
 * editor typed them.
 *
 * Variants are a deliberate ladder of emphasis, not a palette to pick from:
 *
 *   primary        solid ink — the loudest action on a light section
 *   brass          solid brass — the loudest action on a dark ground (the
 *                  page heroes) or where brass is the accent. The CMS's
 *                  "Brass (filled)" choice.
 *   light          solid white — the loudest action on a saturated band,
 *                  where both ink and brass would muddy (the free-estimate
 *                  strip, which is itself brass)
 *   secondary      ink outline that fills on hover — the companion in a pair
 *   outline        soft ink border going brass on hover — a quiet standalone
 *   outline-light  the same, on a dark ground (the pinned header, dark heroes)
 *   line           a plain underlined text link — see `LineButton`
 *
 * `brass` sets ink text, not white. Brass is #C19A5B: white on it is a
 * 2.6:1 contrast ratio, which fails WCAG AA at every size, while ink is
 * 6.1:1. White appears only on the darker `brass-deep` hover, where it is
 * 4.8:1 and passes. Before this was a variant it was hand-written at eight
 * call sites in four different text colours, three of them the failing one.
 */
const buttonVariants = cva(
  'group/btn inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-none border text-center font-semibold uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-ink bg-ink text-white hover:border-ink-2 hover:bg-ink-2 hover:text-white',
        brass:
          'border-brass bg-brass text-ink hover:border-brass-deep hover:bg-brass-deep hover:text-white',
        light: 'border-white bg-white text-ink hover:border-paper hover:bg-paper',
        secondary: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-white',
        // Was border-line (very pale grey) — nearly invisible against a
        // page full of navy and brass. Same interaction as before (text
        // and border shift to brass on hover, no fill), just a border
        // that actually reads as a button at rest.
        outline: 'border-ink/40 bg-transparent text-ink hover:border-brass hover:text-brass-deep',
        'outline-light':
          'border-white/60 bg-transparent text-white hover:border-brass hover:text-brass',
        ghost: 'border-transparent px-0 text-brass hover:text-brass-deep',
      },
      /**
       * `lg` is responsive on its own. It used to be a single fixed step, so
       * every call site that cared about phones — the 404, the thank-you
       * page, the service hero — hand-patched the identical
       * `px-3 py-2.5 text-xs sm:px-6 sm:py-3.5 sm:text-base` on top of it.
       * That override is now the variant's own behaviour.
       */
      size: {
        sm: 'px-4 py-2.5 text-[0.6875rem] tracking-[0.12em]',
        md: 'px-5 py-3.5 text-xs tracking-[0.1em]',
        lg: 'px-6 py-4 text-xs tracking-[0.1em] sm:px-8 sm:text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

/** Arrow glyphs matched to each label size, so they stop drifting. */
const arrowSizes = {
  sm: 'size-3.5',
  md: 'size-4',
  lg: 'size-4 sm:size-[1.125rem]',
} as const

type Variant = NonNullable<VariantProps<typeof buttonVariants>['variant']> | 'line'
type Size = NonNullable<VariantProps<typeof buttonVariants>['size']>

type ButtonStyleProps = {
  variant?: Variant
  size?: Size
  /**
   * Append the trailing arrow. Prefer letting `ButtonGroup` decide: it
   * applies the house rule (a lone button carries the arrow; in a pair it is
   * the second one) so the two never drift apart again.
   */
  arrow?: boolean
  children: ReactNode
  className?: string
}
type ButtonProps = ButtonStyleProps &
  (
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'href'>)
    | ({ href?: undefined } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'>)
  )

/**
 * 'line' variant — plain text link: uppercase label and a hidden underline
 * that becomes visible with a solid currentColor sweep from the left on
 * hover and reverses on leave. Uses currentColor so it works unmodified
 * on both the dark header (parent sets text-white) and light sections
 * (parent sets text-ink, the default).
 */
function LineButton({
  children,
  href,
  className = '',
  ...props
}: Omit<ButtonProps, 'variant' | 'size'>) {
  const wrapperClasses = cn(
    'group relative inline-flex items-center gap-2 pb-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink',
    className,
  )
  const content = (
    <>
      <span className="relative z-10 inline-flex items-center gap-2 whitespace-nowrap">
        {children}
      </span>
      {/* The underline, swept in from the left on hover.
          Scaled rather than translated: at rest the translated copy sat
          exactly one width to the left, and on a fractional x-position the
          browser rounded its right edge back into the clipping box — which
          painted a one-pixel dot under the first letter of every nav item.
          `scale-x-0` from the left edge has no edge to round back in. */}
      <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
        <span className="absolute inset-0 origin-left scale-x-0 bg-current transition-transform duration-300 ease-out group-hover:scale-x-100" />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={wrapperClasses}>
        {content}
      </Link>
    )
  }
  return (
    <button className={wrapperClasses} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
}

export function Button({
  className,
  variant = 'primary',
  size,
  arrow = false,
  children,
  ...props
}: ButtonProps) {
  if (variant === 'line') {
    return (
      <LineButton className={className} {...props}>
        {children}
      </LineButton>
    )
  }

  const classes = cn(buttonVariants({ variant, size }), className)
  const content = (
    <>
      {children}
      {arrow ? (
        <ArrowRight
          className={cn(
            arrowSizes[size ?? 'md'],
            // Named group so the slide answers this button's own hover and
            // not an ancestor card's — several of these sit inside a `group`.
            'shrink-0 transition-transform duration-300 ease-out group-hover/btn:translate-x-1',
          )}
          aria-hidden
        />
      ) : null}
    </>
  )

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props
    return (
      <Link className={classes} href={href} {...linkProps}>
        {content}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {content}
    </button>
  )
}

/**
 * The row a page's call-to-action buttons sit in, and the one place both the
 * arrow rule and the row's mobile behaviour are decided.
 *
 * The rule: a lone button carries the arrow; when two sit together only the
 * second one does. The primary is already the loudest thing in the row
 * through its fill, so an arrow on it as well makes the pair compete — and
 * the arrow is exactly what gives the quieter second button its own forward
 * pull. Pages used to decide this by hand and disagreed with each other: the
 * Silicon Valley Loves section arrowed both of its buttons, several sections
 * arrowed none, and the glyph ranged from a typed → through 12px, 14px and
 * 16px icons to lucide's unstyled 24px default.
 *
 * `line` buttons never take an arrow and do not count towards the pair —
 * they are text links sharing the row, not the row's second action.
 * An explicit `arrow` prop on a child always wins.
 *
 * Below `sm` a pair stops being a row at all and stacks, one full-width
 * button per line; from `sm` up the buttons take their natural widths side
 * by side. See the note on `stacks` for why a phone cannot hold two of
 * these side by side.
 */
export function ButtonGroup({
  align = 'start',
  className,
  children,
}: {
  align?: 'start' | 'center'
  className?: string
  children: ReactNode
}) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<ButtonProps>[]

  // `line` buttons are text links sharing the row, not actions in it: they
  // take no arrow, they are never stretched (their underline is `inset-x-0`
  // and would run the width of the row), and they do not count towards the
  // pair.
  const real = items.filter((child) => child.type === Button && child.props.variant !== 'line')
  const carriesArrow = real[real.length - 1]

  // Below `sm` a pair stacks, one full-width button per row. Side by side on
  // a phone each button has roughly 106px inside its padding — about eleven
  // uppercase characters — and every real CTA on the site is longer, so one
  // of the two always wrapped onto a second line while the other stayed on
  // one. Stacked they keep to one line, match each other's width, and each
  // becomes a full-row tap target. A lone button keeps its natural width.
  const stacks = real.length > 1

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-3 sm:gap-4',
        align === 'center' && 'justify-center',
        className,
      )}
    >
      {items.map((child, index) =>
        real.includes(child)
          ? cloneElement(child, {
              key: child.key ?? index,
              arrow: child.props.arrow ?? child === carriesArrow,
              className: cn(stacks && 'max-sm:w-full', child.props.className),
            })
          : child,
      )}
    </div>
  )
}

export { buttonVariants }
