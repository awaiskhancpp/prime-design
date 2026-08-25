import type { InputHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full  border border-line bg- px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-2/45 focus:border-brass',
        className,
      )}
      {...props}
    />
  )
}
