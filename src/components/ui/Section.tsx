import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Container } from './Container'

export function Section({
  className,
  containerClassName,
  id,
  children,
}: {
  className?: string
  containerClassName?: string
  id?: string
  children: ReactNode
}) {
  return (
    <section className={cn('py-10 md:py-14 lg:py-16', className)} id={id}>
      <Container className={containerClassName}>{children}</Container>
    </section>
  )
}
