import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function Container({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-5 lg:px-2', className)}>{children}</div>
}
