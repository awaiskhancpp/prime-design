// components/ui/Button.tsx
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import Link from 'next/link'

import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-none border font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brass disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'border-ink bg-ink text-white hover:border-ink-2 hover:bg-ink-2 hover:text-white',
        secondary: 'border-ink bg-transparent text-ink hover:bg-ink hover:text-white',
        outline:
          'border border-line bg-transparent text-ink hover:border-brass hover:text-brass-deep',
        'outline-light':
          'border border-white/50 bg-transparent text-white hover:border-brass hover:text-brass',
        ghost: 'border-transparent px-0 text-brass hover:text-brass-deep',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        md: 'px-5 py-3 text-sm',
        lg: 'px-6 py-3.5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type Variant = NonNullable<VariantProps<typeof buttonVariants>['variant']> | 'line'
type Size = NonNullable<VariantProps<typeof buttonVariants>['size']>

type ButtonStyleProps = { variant?: Variant; size?: Size; children: ReactNode; className?: string }
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
      <span className="absolute inset-x-0 bottom-0 h-px overflow-hidden" aria-hidden="true">
        <span className="absolute inset-0 -translate-x-full bg-current transition-transform duration-300 ease-out group-hover:translate-x-0" />
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

export function Button({ className, variant = 'primary', size, children, ...props }: ButtonProps) {
  if (variant === 'line') {
    return (
      <LineButton className={className} {...props}>
        {children}
      </LineButton>
    )
  }

  const classes = cn(buttonVariants({ variant, size }), className)

  if ('href' in props && props.href) {
    const { href, ...linkProps } = props
    return (
      <Link className={classes} href={href} {...linkProps}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  )
}

export { buttonVariants }
