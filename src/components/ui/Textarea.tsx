import type { TextareaHTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full  border border-line  px-4 py-3 text-sm text-ink outline-none placeholder:text-ink-2/45 focus:border-brass',
        className,
      )}
      {...props}
    />
  )
}
