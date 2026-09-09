import Image from 'next/image'
import { Wrench } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { richTextToPlainText, type RichTextValue } from '@/lib/richText'

type Category = {
  title?: string
  heading?: string
  description?: RichTextValue | string
  features?: Array<{ text?: string }>
  media?: unknown
}

function mediaUrl(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return undefined
  const record = value as Record<string, unknown>
  if (typeof record.url === 'string') return record.url
  return mediaUrl(record.asset)
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

      <div className="mt-12 grid gap-8">
        {items.map((category, index) => (
          <article
            key={`${category.title}-${index}`}
            className="grid gap-8 border-b border-line pb-8 md:grid-cols-2 md:items-center"
          >
            <div className={index % 2 ? 'md:order-2' : undefined}>
              {mediaUrl(category.media) ? (
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                  <Image src={mediaUrl(category.media)!} alt={category.title || 'Service'} fill className="object-cover" unoptimized={mediaUrl(category.media)!.includes('/api/media/file/')} />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-center justify-center bg-paper-2 text-brass">
                  <Wrench className="h-8 w-8" strokeWidth={1.5} aria-hidden />
                </div>
              )}
            </div>
            <div className={index % 2 ? 'md:order-1' : undefined}>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">{category.title}</p>
              <h3 className="mt-2 font-display text-2xl font-medium text-ink">{category.heading || category.title}</h3>
              {richTextToPlainText(category.description) ? (
                <p className="mt-3 text-base leading-7 text-ink-2/75">
                  {richTextToPlainText(category.description)}
                </p>
              ) : null}
              {category.features?.length ? (
                <ul className="mt-5 grid gap-2.5 border-t border-line pt-5">
                  {category.features.filter((feature) => feature.text).map((feature, featureIndex) => (
                    <li key={`${feature.text}-${featureIndex}`} className="flex items-start gap-2 text-sm text-ink-2/75">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brass" aria-hidden />
                      {feature.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
