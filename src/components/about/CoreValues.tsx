import Image from 'next/image'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'

export function CoreValues() {
  const { coreValues } = website.about

  return (
    <Section className="bg-white text-ink-2">
      <div className="mx-auto max-w-3xl">
        <h2 className="mx-auto mt-4 max-w-xl text-center font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          {coreValues.heading}
        </h2>
        <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-ink-2/75 md:text-lg">
          {coreValues.description}
        </p>
      </div>

      <div className="mt-14 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
        {coreValues.items.map((value) => {
          return (
            <article key={value.title} className="bg-white px-6 py-8 md:px-7 lg:px-8 ">
              <Image src={value.icon} alt="" aria-hidden="true" width={120} height={120} />
              <h3 className="mt-6 font-display text-2xl font-medium text-ink-2">{value.title}</h3>
            </article>
          )
        })}
      </div>
    </Section>
  )
}
