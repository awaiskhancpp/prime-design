import Image from 'next/image'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Section } from '@/components/ui/Section'
import type { RichTextValue } from '@/lib/richText'

/**
 * "A Client-Centered Approach to Home Remodeling" — a Payload-authored rich
 * text section (heading + intro + numbered process steps) rendered below the
 * estimate CTA on the Complete Renovation page. The side image comes from the
 * service's `clientApproachImage` upload field and falls back to the phone
 * mockup when that field is empty.
 */
export function ServiceClientApproachSection({
  content,
  image,
}: {
  content: RichTextValue
  image?: string
}) {
  const sideImage = image || '/prime-design-phone.webp'

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[1fr_0.7fr] lg:items-start lg:gap-16">
        <div>
          <RichTextContent data={content} />
        </div>

        <div className="flex justify-center lg:sticky lg:top-24">
          <Image
            src={sideImage}
            alt="Prime Design & Build"
            width={500}
            height={700}
            className="h-auto max-h-[650px] w-auto object-contain"
          />
        </div>
      </div>
    </Section>
  )
}
