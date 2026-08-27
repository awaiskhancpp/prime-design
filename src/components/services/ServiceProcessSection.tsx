import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceContentStep, ServiceDetail } from '@/lib/services'
import { cn } from '@/lib/utils'

const kitchenPhotos = [
  '/services/kitchen-remodeling.jpeg',
  '/before-after/complete_remodeling_after.jpeg',
  '/services/home-remodeling.jpeg',
  '/before-after/bathroom_remodeling_after.jpeg',
]

const bathroomPhotos = [
  '/before-after/bathroom_remodeling_after.jpeg',
  '/before-after/bathroom_remodeling_before.jpg',
  '/services/home-remodeling.jpeg',
  '/services/kitchen-remodeling.jpeg',
]

function withPhotos(steps: ServiceContentStep[], photos: string[]) {
  return steps.map((step, index) => ({
    ...step,
    image: step.image || photos[index % photos.length],
  }))
}

export type ServiceProcessContent = {
  eyebrow?: string
  title: string
  description?: string
  cta?: { label: string; href: string }
  steps: ServiceContentStep[]
}

const kitchenProcess: ServiceProcessContent = {
  eyebrow: 'Our process',
  title: 'We make it easy for you',
  description:
    'From the first conversation to the final reveal, we keep kitchen remodeling straightforward—so your vision becomes a finished space without the usual stress.',
  cta: { label: 'Schedule your free consultation', href: '/contact' },
  steps: withPhotos(
    [
      {
        title: 'Initial consultation',
        description:
          'We sit down to discuss your kitchen ideas, preferences, and budget. Our team evaluates your existing space and answers questions so you know exactly what comes next.',
      },
      {
        title: 'Customized design',
        description:
          'Our designers turn that conversation into a plan that fits how you cook and gather. 3D renderings help you see the kitchen before construction begins.',
      },
      {
        title: 'Efficient project management',
        description:
          'Once you approve the design, we source materials, set the schedule, and coordinate every trade so the remodel stays organized from start to finish.',
      },
      {
        title: 'Skilled craftsmanship',
        description:
          'Our craftsmen handle demolition, installation, and finishing with care—bringing the approved design to life with the details that make a kitchen last.',
      },
      {
        title: 'Clear communication',
        description:
          'You hear from us throughout the project. We share progress, flag decisions early, and make sure nothing about the work in your home feels like a surprise.',
      },
      {
        title: 'Final reveal',
        description:
          'We inspect every detail, then walk you through your finished kitchen—ready for the meals and gatherings you planned it around.',
      },
    ],
    kitchenPhotos,
  ),
}

const bathroomProcess: ServiceProcessContent = {
  eyebrow: 'Our process',
  title: 'Let’s build your dream bathroom, step by step',
  description:
    'We design bathrooms that balance function, finish, and the way you actually use the space—then we build them with the same care as every other Prime project.',
  cta: { label: 'Schedule your free consultation', href: '/contact' },
  steps: withPhotos(
    [
      {
        title: 'Initial consultation',
        description:
          'We talk through how you use the bathroom, what you want to change, and your budget. A walkthrough of the existing space helps us flag layout and plumbing opportunities early.',
      },
      {
        title: 'Customized design',
        description:
          'Our designers plan fixtures, finishes, and storage around your routine. You review the design before we order materials or start demolition.',
      },
      {
        title: 'Efficient project management',
        description:
          'We coordinate waterproofing, tile, millwork, and fixtures on one schedule so a compact space does not turn into a drawn-out disruption.',
      },
      {
        title: 'Skilled craftsmanship',
        description:
          'From the shower pan to the last piece of trim, the work is built to stay watertight and look considered—not just new.',
      },
      {
        title: 'Clear communication',
        description:
          'Bathroom remodels live in the middle of daily life. We keep you informed about access, timing, and any decisions that come up on site.',
      },
      {
        title: 'Final reveal',
        description:
          'After a thorough inspection, we hand over a bathroom that is ready to use—clean, complete, and built to the plan you approved.',
      },
    ],
    bathroomPhotos,
  ),
}

const processBySlug: Record<string, ServiceProcessContent> = {
  'kitchen-remodeling': kitchenProcess,
  'bathroom-remodeling': bathroomProcess,
}

export function getServiceProcess(service: ServiceDetail): ServiceProcessContent | undefined {
  const specific = processBySlug[service.slug]
  if (specific) return specific

  const cmsSteps = service.contentBlocks?.find((block) => block.blockType === 'process')
  if (cmsSteps && cmsSteps.blockType === 'process' && cmsSteps.steps.length) {
    return {
      eyebrow: 'Our process',
      title: cmsSteps.heading || 'We make it easy for you',
      steps: withPhotos(cmsSteps.steps, [service.image, ...service.gallery]),
    }
  }

  return undefined
}

export function ServiceProcessSection({
  eyebrow,
  title,
  description,
  cta,
  steps,
}: ServiceProcessContent) {
  if (!steps.length) return null

  return (
    <Section className="bg-white">
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

      <ol className="mt-14 grid gap-16 md:gap-20">
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
                <p className="mt-4 max-w-xl text-base leading-7 text-ink-2/70">{step.description}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </Section>
  )
}
