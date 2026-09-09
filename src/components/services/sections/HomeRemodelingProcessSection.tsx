import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { ServiceContentStep } from '@/lib/services'
import { cn } from '@/lib/utils'

// This content used to live inside the shared ServiceProcessSection.tsx as
// `homeProcess`, registered under both the 'complete-renovation' and
// 'home-remodeling' slugs in that file's `processBySlug` map. Editing it
// there meant any change also risked touching Kitchen, Bathroom, ADU, and
// Additions, since they all render through the same shared component and
// lookup table. Pulling it out here means this page's process section is
// now fully independent — edit it freely without affecting any other
// service page.

const defaultTitle = 'A Client-Centered Approach to Home Remodeling'
const defaultDescription =
  'No matter the type of project we take on, the entire process, from start to finish.'
const defaultSideImage = '/prime-design-phone.webp'

const defaultSteps: ServiceContentStep[] = [
  {
    title: 'Free Consultation',
    description:
      'We begin by understanding your vision, lifestyle, and goals for your home. Our experienced team listens attentively to your ideas, providing valuable insights and expert advice.',
  },
  {
    title: 'Customized Design',
    description:
      'Our talented designers translate your vision into a personalized design plan that captures your unique style and preferences.',
  },
  {
    title: 'Skilled Project Management',
    description:
      'Our dedicated project managers oversee every aspect of the renovation process, ensuring seamless coordination of contractors, timelines, and resources. We keep you informed at every stage, providing peace of mind.',
  },
  {
    title: 'Quality Craftsmanship',
    description:
      'Our skilled craftsmen bring precision and artistry to every detail of your project.',
  },
]

export function HomeRemodelingProcessSection({
  title = defaultTitle,
  description = defaultDescription,
  steps = defaultSteps,
  sideImage = defaultSideImage,
}: {
  title?: string
  description?: string
  steps?: ServiceContentStep[]
  sideImage?: string
} = {}) {
  if (!steps.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader align="center" title={title} description={description} />

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
