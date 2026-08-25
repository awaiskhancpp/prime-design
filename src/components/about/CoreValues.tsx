import { ClipboardCheck, Handshake, Hammer, Home, Lightbulb, ShieldCheck } from 'lucide-react'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'

const valueIcons = [Home, ShieldCheck, Handshake, Lightbulb, ClipboardCheck, Hammer]

export function CoreValues() {
  const { coreValues } = website.about

  return (
    <Section className="bg-white text-ink-2">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass">
          {coreValues.eyebrow}
        </p>
        <h2 className="mt-4 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          {coreValues.heading}
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-ink-2/75 md:text-lg">
          {coreValues.description}
        </p>
      </div>

      <div className="mt-14 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
        {coreValues.items.map((value, index) => {
          const Icon = valueIcons[index]

          return (
            <article
              key={value.title}
              className="bg-white px-6 py-8 md:px-7 lg:px-8 lg:first:pl-0 lg:last:pr-0"
            >
              <Icon aria-hidden="true" className="h-7 w-7 text-brass" strokeWidth={1.5} />
              <h3 className="mt-6 font-display text-2xl font-medium text-ink-2">
                {value.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-ink-2/70">{value.description}</p>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
