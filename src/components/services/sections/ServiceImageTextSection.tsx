import Image from '@/components/ui/Image'
import { Fragment, type ReactNode } from 'react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { richTextHasContent, type RichTextValue } from '@/lib/richText'

/**
 * Image + text section used for migrated WordPress content (e.g. the
 * "Home Additions - Enhancing Your Living Space" block on Additions / ADU /
 * Complete Renovation). The WordPress body is a structured list ("Key
 * Features:", "Benefits of …:", "Process:") — rendered here as rich text
 * (labelled groups + bullet lists) instead of one big plain-text paragraph.
 *
 * Lives in its own file (was previously inline in LandingBlockRenderer) so it
 * can be reused by service sections and landing pages, and its content always
 * comes from the Payload CMS block.
 */

function isPayloadFileUrl(value: string) {
  return value.startsWith('/api/media/file/') || value.includes('/api/media/file/')
}

function RichTextLines({ text }: { text: string }) {
  const lines = (text || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)

  const blocks: ReactNode[] = []
  let bullets: string[] = []
  const flushBullets = (key: number) => {
    if (!bullets.length) return
    blocks.push(
      <ul key={`bullets-${key}`} className="mt-4 grid gap-3 text-base leading-7 text-ink-2/75">
        {bullets.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-brass" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>,
    )
    bullets = []
  }

  lines.forEach((line, index) => {
    const bullet = line.match(/^[•▪*-]\s*(.*)$/)
    if (bullet) {
      bullets.push(bullet[1] || line)
      return
    }
    flushBullets(index)
    const isLabel = /^[A-Z].{0,60}:\s*$/.test(line)
    if (isLabel) {
      blocks.push(
        <p key={`label-${index}`} className="mt-6 font-display text-lg font-medium text-ink-2">
          {line}
        </p>,
      )
    } else {
      blocks.push(
        <p key={`p-${index}`} className="mt-4 text-base leading-7 text-ink-2/75">
          {line}
        </p>,
      )
    }
  })
  flushBullets(lines.length)

  return (
    <>
      {blocks.map((block, i) => (
        <Fragment key={`f-${i}`}>{block}</Fragment>
      ))}
    </>
  )
}

export type ServiceImageTextContent = {
  eyebrow?: string
  heading: string
  /**
   * Plain-text body, kept for the service-page callers that still store one.
   * `RichTextLines` re-derives labels and bullets from it heuristically.
   */
  description?: string
  /**
   * Lexical rich text from the CMS. Takes precedence over `description`:
   * where the editor has real structure there is no need to guess it back
   * out of a flattened string.
   */
  body?: RichTextValue
  image?: string
  /** 'left' | 'right' — which side the image sits on. */
  imageSide?: string
  cta?: { label: string; href: string }
}

export function ServiceImageTextSection({
  eyebrow,
  heading,
  description,
  body,
  image,
  imageSide = 'left',
  cta,
}: ServiceImageTextContent) {
  const hasRichBody = richTextHasContent(body)
  return (
    <Section className="bg-white">
      <div className="grid gap-10 md:grid-cols-2 md:items-center">
        <div className={imageSide === 'right' ? 'md:order-2' : undefined}>
          <SectionHeader eyebrow={eyebrow} title={heading} size="lg" className="max-w-none" />
          {hasRichBody ? (
            <div className="mt-5 text-base leading-7 text-ink-2/75">
              <RichTextContent data={body} />
            </div>
          ) : description ? (
            <RichTextLines text={description} />
          ) : null}
          {cta ? (
            <Button href={cta.href} variant="outline" className="mt-6">
              {cta.label}
            </Button>
          ) : null}
        </div>
        {image ? (
          <div className="relative aspect-[4/3] overflow-hidden ">
            <Image
              src={image}
              alt={heading}
              fill
              className="object-cover"
              unoptimized={isPayloadFileUrl(image)}
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
