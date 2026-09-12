import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { AboutCoreValues as AboutCoreValuesValue } from '@/lib/about'

/**
 * CMS-driven Core Values grid. WordPress values have icon + title only;
 * the optional rich-text body renders when a value has one.
 */
export function CoreValues({ coreValues }: { coreValues?: AboutCoreValuesValue }) {
  const heading = coreValues?.heading || 'Our Core Values'
  const description = coreValues?.description
  const values = coreValues?.values ?? []

  return (
    <Section className="bg-white text-ink-2">
      <div className="mx-auto max-w-3xl">
        <h2 className="mx-auto mt-4 max-w-xl text-center font-display text-4xl font-medium leading-tight tracking-tight text-ink-2 md:text-6xl">
          {heading}
        </h2>
        {description ? (
          <p className="mx-auto mt-6 max-w-3xl text-center text-base leading-7 text-ink-2/75 md:text-lg">
            {description}
          </p>
        ) : null}
      </div>

      <div className="mt-14 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => {
          return (
            <article key={value.title} className="bg-white px-6 py-8 md:px-7 lg:px-8 ">
              {value.icon ? (
                <Image src={value.icon} alt="" aria-hidden="true" width={120} height={120} />
              ) : null}
              <h3 className="mt-6 font-display text-2xl font-medium text-ink-2">{value.title}</h3>
              {value.body ? (
                <div className="mt-3 text-base leading-7 text-ink-2/70">
                  <RichTextContent data={value.body} />
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </Section>
  )
}
