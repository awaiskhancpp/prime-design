import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Container } from './Container'

export function Section({
  className,
  containerClassName,
  id,
  style,
  children,
}: {
  className?: string
  containerClassName?: string
  id?: string
  style?: CSSProperties
  children: ReactNode
}) {
  return (
    <section className={cn('py-10 md:py-14 lg:py-16', className)} id={id} style={style}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}
