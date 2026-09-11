import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceContentStep } from '@/lib/services'
import { cn } from '@/lib/utils'

export function HomeRemodelingProcessSection({
  title = '',
  description = '',
  steps = [],
  sideImage = '',
}: {
  title?: string
  description?: string
  steps?: ServiceContentStep[]
  sideImage?: string
} = {}) {
  // Content comes from Payload only — render nothing without steps.
  if (!steps.length) return null

  return (
    <Section className="bg-white">
      {title ? <SectionHeader align="center" title={title} description={description} /> : null}

      <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-start lg:gap-16">
        <ol className="grid gap-10 md:gap-10">
          {steps.map((step, index) => {
            const reversed = index % 2 === 1

            return (
              <li
                key={`${step.title}-${index}`}
                className={cn('grid items-center gap-8 md:gap-8', step.image && 'md:grid-cols-2')}
              >
                {step.image ? (
                  <div
                    className={cn(
                      'relative aspect-[4/3] overflow-hidden bg-paper-2',
                      reversed && 'md:order-2',
                    )}
                  >
                    <Image src={step.image} alt={step.title} fill className="object-cover" />
                  </div>
                ) : null}

                <div className={cn(reversed && step.image && 'md:order-1')}>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
                    Step {String(index + 1).padStart(2, '0')}
                  </p>

                  <h3 className="mt-1 font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl">
                    {step.title}
                  </h3>

                  <p className="mt-2 max-w-xl text-base leading-7 text-ink-2/70">
                    {step.description}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>

        {sideImage ? (
          <div className="flex justify-center lg:sticky lg:top-24">
            <Image
              src={sideImage}
              alt="Prime Design & Build"
              width={500}
              height={700}
              className="h-auto max-h-[650px] w-auto object-contain"
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
