import Image from 'next/image'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Section } from '@/components/ui/Section'
import type { RichTextValue } from '@/lib/richText'

/**
 * Finance page "Renovation financing, simplified." section — the WordPress
 * design: heading + rich-text body (with the ordered financing steps) on
 * the left, the phone image on the RIGHT. Content and image come from the
 * CMS block.
 */
export function ServiceFinanceProcessSection({
  heading,
  content,
  image,
}: {
  heading: string
  content?: RichTextValue
  image?: string
}) {
  return (
    <Section className="bg-white">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <h2 className="font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
            {heading}
          </h2>
          {content ? (
            <div className="mt-6">
              <RichTextContent data={content} />
            </div>
          ) : null}
        </div>

        {image ? (
          <div className="relative aspect-[3/4] overflow-hidden bg-paper-2">
            <Image
              src={image}
              alt=""
              fill
              className="object-contain"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
