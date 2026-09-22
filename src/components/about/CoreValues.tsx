import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { PageCoreValuesContent as AboutCoreValuesValue } from '@/lib/pageSections'

/**
 * CMS-driven Core Values grid. WordPress values have icon + title only;
 * the optional rich-text body renders when a value has one.
 */
export function CoreValues({ coreValues }: { coreValues?: AboutCoreValuesValue }) {
  const heading = coreValues?.heading ?? ''
  const description = coreValues?.description
  const values = coreValues?.values ?? []

  return (
    <Section className="bg-white text-ink-2">
      {/* Centered header over a grid — the `lg` set-piece size, with the
          standing "Our values" label. The heading and description are the
          migrated WordPress strings, untouched; the eyebrow is the only
          addition, and there is no CMS field for it yet. */}
      <SectionHeader align="center" size="lg" eyebrow="Our values" title={heading} description={description} />

      <div className="mt-14 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-3">
        {values.map((value) => {
          return (
            <article key={value.title} className="bg-white px-6 py-8 md:px-7 lg:px-8 ">
              {value.icon ? (
                <Image src={value.icon} alt="" aria-hidden="true" width={100} height={100} />
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
