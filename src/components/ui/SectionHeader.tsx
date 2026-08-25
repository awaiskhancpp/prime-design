import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}: {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div className={cn('max-w-2xl space-y-4', align === 'center' && 'mx-auto text-center')}>
      {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">{eyebrow}</p>}
      <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">{title}</h2>
      {description && <p className="max-w-xl text-base leading-[1.7] text-ink-2/70">{description}</p>}
    </div>
  )
}
