import { Award, BrainCircuit, HeartHandshake, Workflow } from 'lucide-react'

import { Section } from '@/components/ui/Section'

const reasons = [
  {
    icon: BrainCircuit,
    title: 'Attention to Detail',
    body: 'We meticulously plan and execute every project with precision and attention to detail.',
  },
  {
    icon: Workflow,
    title: 'Quality Craftsmanship',
    body: 'Our commitment to quality ensures outstanding and beautiful home transformations.',
  },
  {
    icon: Award,
    title: 'Professional Expertise',
    body: 'With years of industry experience, we create exceptional, tailored home remodels.',
  },
  {
    icon: HeartHandshake,
    title: 'Customer Satisfaction',
    body: 'We prioritize your satisfaction with exceptional service and communication.',
  },
]

export function WhyChooseUs() {
  return (
    <Section className="">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-display text-lg italic text-ink-2/70">
          Experience the{' '}
          <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text font-semibold text-transparent">
            &ldquo;Prime Difference&rdquo;
          </span>
        </p>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
          Why choose Prime Design &amp; Build?
        </h2>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, body }, index) => (
          <div
            key={title}
            className="group relative border border-line bg-paper p-8 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
          >
            <span
              className="absolute left-0 top-0 h-0.5 w-0 bg-brass transition-all duration-300 ease-out group-hover:w-full"
              aria-hidden
            />

            <span className="text-xs font-semibold text-brass-deep/50">
              {String(index + 1).padStart(2, '0')}
            </span>

            <div className="mt-5 flex h-14 w-14 items-center justify-center ">
              <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
            </div>

            <h3 className="mt-6 font-display text-xl font-medium text-ink">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-ink-2/65">{body}</p>
          </div>
        ))}
      </div>
    </Section>
  )
}
