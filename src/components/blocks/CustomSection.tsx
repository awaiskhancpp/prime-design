import Image from 'next/image'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { HighlightedText } from '@/components/ui/HighlightedText'
import { Section } from '@/components/ui/Section'
import type { CustomSectionContent } from '@/lib/sections'

/**
 * The generic "Custom section" block — see `collections/blocks/SharedBlocks`.
 * Editors can drop it onto any blocks-based page to add copy that doesn't fit
 * one of the fixed section layouts: eyebrow, heading, rich text, an optional
 * image and up to two buttons.
 */
export function CustomSection({ section }: { section: CustomSectionContent }) {
  const hasImage = Boolean(section.image)

  return (
    <Section className="bg-white">
      <div
        className={
          hasImage
            ? 'grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16'
            : 'mx-auto max-w-3xl'
        }
      >
        <div className={hasImage && section.imageSide === 'left' ? 'lg:order-2' : undefined}>
          {section.eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {section.eyebrow}
            </p>
          ) : null}

          <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink-2 md:text-4xl">
            <HighlightedText text={section.heading} highlight={section.headingHighlight} />
          </h2>

          {section.body ? (
            <div className="mt-5 text-base leading-8 text-ink-2/75">
              <RichTextContent data={section.body} />
            </div>
          ) : null}

          {section.buttons.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {section.buttons.map((button, index) => (
                <Button
                  key={`${button.href}-${index}`}
                  href={button.href}
                  variant={index === 0 ? 'primary' : 'outline'}
                >
                  {button.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>

        {hasImage ? (
          <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
            <Image
              src={section.image as string}
              alt={section.heading}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>
        ) : null}
      </div>
    </Section>
  )
}
