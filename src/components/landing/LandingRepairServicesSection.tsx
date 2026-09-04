import { Wrench } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

type Category = {
  title?: string
  description?: string
  features?: Array<{ text?: string }>
}

export function LandingRepairServicesSection({
  eyebrow = 'Repair & installation',
  heading,
  description,
  categories = [],
}: {
  eyebrow?: string
  heading?: string
  description?: string
  categories?: Category[]
}) {
  const items = categories.filter((item) => item.title)
  if (!items.length) return null

  return (
    <Section className="bg-white">
      <SectionHeader
        eyebrow={eyebrow}
        title={heading || 'Repair & installation services'}
        description={description}
      />

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {items.map((category, index) => (
          <article
            key={`${category.title}-${index}`}
            className="border border-line bg-paper p-7 transition-shadow duration-300 hover:shadow-lg hover:shadow-ink/5"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-brass/40 text-brass-deep">
              <Wrench className="h-5 w-5" strokeWidth={1.5} aria-hidden />
            </div>
            <h3 className="mt-5 font-display text-2xl font-medium text-ink">{category.title}</h3>
            {category.description ? (
              <p className="mt-3 text-sm leading-6 text-ink-2/70">{category.description}</p>
            ) : null}
            {category.features?.length ? (
              <ul className="mt-5 grid gap-2.5 border-t border-line pt-5">
                {category.features
                  .filter((feature) => feature.text)
                  .map((feature, featureIndex) => (
                    <li
                      key={`${feature.text}-${featureIndex}`}
                      className="flex items-start gap-2 text-sm text-ink-2/75"
                    >
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass" aria-hidden />
                      {feature.text}
                    </li>
                  ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </Section>
  )
}
