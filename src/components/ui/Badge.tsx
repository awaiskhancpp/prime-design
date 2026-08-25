import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Badge({ className, children, ...props }: HTMLAttributes<HTMLSpanElement> & { children: ReactNode }) {
  return (
    <span className={cn('inline-flex w-fit items-center rounded-full border border-brass/40 px-3 py-1 text-xs font-medium text-brass-deep', className)} {...props}>
      {children}
    </span>
  )
}
