'use client'

import Image from '@/components/ui/Image'
import { useEffect, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
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

const STEP_SCROLL_HEIGHT = 500

export function ServiceProcessSection({
  eyebrow,
  title,
  description,
  cta,
  steps,
  hideHeader = false,
}: ServiceProcessContent & { hideHeader?: boolean }) {
  const [activeStep, setActiveStep] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const validSteps = steps.filter((s) => s.title)

  useEffect(() => {
    if (!validSteps.length) return

    function onScroll() {
      const el = scrollRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const scrolled = -rect.top
      if (scrolled < 0) {
        setActiveStep(0)
        return
      }
      const step = Math.min(validSteps.length - 1, Math.floor(scrolled / STEP_SCROLL_HEIGHT))
      setActiveStep(step)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [validSteps.length])

  if (!validSteps.length) return null

  const scrollHeight = `calc(100vh + ${validSteps.length * STEP_SCROLL_HEIGHT}px)`
  const progressPercent = ((activeStep + 1) / validSteps.length) * 100

  const scrollToStep = (index: number) => {
    const el = scrollRef.current
    if (!el) return
    window.scrollTo({ top: el.offsetTop + index * STEP_SCROLL_HEIGHT + 10, behavior: 'smooth' })
  }

  return (
    <div>
      {!hideHeader ? (
        <div className="bg-white px-6 pb-0 pt-20 md:px-12 md:pt-24">
          <SectionHeader align="center" eyebrow={eyebrow} title={title} description={description} />
          {cta ? (
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
        </div>
      ) : null}

      <div ref={scrollRef} style={{ height: scrollHeight }}>
        <div className="sticky top-0 h-screen overflow-hidden bg-white">
          <div className="grid h-full lg:grid-cols-2">
            {/* Left: contained image */}
            <div className="relative hidden overflow-hidden bg-white lg:block">
              {/* Progress bar on left edge */}
              <div className="absolute bottom-0 left-0 top-0 z-10 w-0.5 bg-line">
                <div
                  className="absolute left-0 top-0 w-full bg-brass transition-all duration-500 ease-out"
                  style={{ height: `${progressPercent}%` }}
                />
              </div>

              <div className="flex h-full items-center justify-center p-12">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: '4/3' }}>
                  {validSteps.map((step, index) => (
                    <div
                      key={`img-${index}`}
                      className={cn(
                        'absolute inset-0 transition-all duration-700 ease-out',
                        activeStep === index ? 'scale-100 opacity-100' : 'scale-105 opacity-0',
                      )}
                    >
                      {step.image ? (
                        <Image
                          src={step.image}
                          alt={step.title}
                          fill
                          className="object-cover"
                          sizes="40vw"
                          priority={index === 0}
                        />
                      ) : (
                        <div className="h-full w-full bg-paper-2" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: text panel */}
            <div className="relative flex flex-col">
              {/* Step indicator strip */}
              <div className="flex gap-1 px-8 pt-20 md:px-12 md:pt-20">
                {validSteps.map((_, index) => (
                  <button
                    key={`ind-${index}`}
                    type="button"
                    aria-label={`Go to step ${index + 1}`}
                    onClick={() => scrollToStep(index)}
                    className={cn(
                      'h-0.5 flex-1 transition-all duration-300',
                      index < activeStep
                        ? 'bg-brass'
                        : index === activeStep
                          ? 'bg-brass/50'
                          : 'bg-line',
                    )}
                  />
                ))}
              </div>

              {/* Step content */}
              <div className="relative flex-1">
                {validSteps.map((step, index) => (
                  <div
                    key={`step-${index}`}
                    aria-hidden={activeStep !== index}
                    className={cn(
                      'absolute inset-0 flex flex-col justify-center px-8 transition-all duration-500 ease-out md:px-12',
                      activeStep === index
                        ? 'pointer-events-auto translate-y-0 opacity-100'
                        : 'pointer-events-none translate-y-6 opacity-0',
                    )}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brass">
                      Step {String(index + 1).padStart(2, '0')} /{' '}
                      {String(validSteps.length).padStart(2, '0')}
                    </p>
                    <span aria-hidden className="mt-4 block h-0.5 w-10 bg-brass" />
                    <h3 className="mt-4 font-display text-2xl font-medium leading-tight text-ink-2 md:text-3xl lg:text-4xl">
                      {step.title}
                    </h3>
                    {step.description ? (
                      <p className="mt-5 max-w-lg text-base leading-7 text-ink-2/65">
                        {step.description}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Nav dots */}
              <div className="flex items-center justify-end gap-2 px-8 pb-16 md:px-12 md:pb-16">
                <span className="mr-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-2/30">
                  Scroll to explore
                </span>
                {validSteps.map((_, index) => (
                  <button
                    key={`dot-${index}`}
                    type="button"
                    aria-label={`Go to step ${index + 1}`}
                    onClick={() => scrollToStep(index)}
                    className={cn(
                      'rounded-full transition-all duration-300',
                      activeStep === index
                        ? 'h-2 w-2 scale-125 bg-brass'
                        : 'h-1.5 w-1.5 bg-line hover:bg-brass/50',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
