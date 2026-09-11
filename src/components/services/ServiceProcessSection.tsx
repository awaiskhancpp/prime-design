import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceContentStep } from '@/lib/services'
import { cn } from '@/lib/utils'

export type ServiceProcessContent = {
  eyebrow?: string
  title: string
  description?: string
  cta?: { label: string; href: string }
  steps: ServiceContentStep[]
}

export function ServiceProcessSection({
  eyebrow,
  title,
  description,
  cta,
  steps,
  hideHeader = false,
}: ServiceProcessContent & { hideHeader?: boolean }) {
  if (!steps.length) return null

  return (
    <Section className="bg-white">
      {!hideHeader ? (
        <SectionHeader align="center" eyebrow={eyebrow} title={title} description={description} />
      ) : null}

      {!hideHeader && cta ? (
        <div className="mt-8 flex justify-center">
          <Button
            href={cta.href}
            className="border-brass bg-brass text-white hover:border-brass-deep hover:bg-brass-deep"
          >
            {cta.label}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      ) : null}

      <ol className={`${hideHeader ? '' : 'mt-14 '}grid gap-16 md:gap-20`}>
        {steps.map((step, index) => {
          const reversed = index % 2 === 1

          return (
            <li
              key={`${step.title}-${index}`}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-14"
            >
              {step.image ? (
                <div
                  className={cn(
                    'relative aspect-[4/3] overflow-hidden bg-paper-2',
                    reversed && 'md:order-2',
                  )}
                >
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </div>
              ) : null}

              <div className={cn(reversed && 'md:order-1')}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                  Step {String(index + 1).padStart(2, '0')}
                </p>
                <h3 className="mt-3 font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
                  {step.title}
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-ink-2/70">
                  {step.description}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
