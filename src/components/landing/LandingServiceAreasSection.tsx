import Link from 'next/link'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

type Area = { label?: string; href?: string }

export function LandingServiceAreasSection({
  eyebrow = 'Where we work',
  heading,
  areas = [],
}: {
  eyebrow?: string
  heading?: string
  areas?: Area[]
}) {
  const items = areas.filter((item) => item.label)
  if (!items.length) return null

  return (
    <Section className="bg-paper">
      <SectionHeader eyebrow={eyebrow} title={heading || 'Areas we service'} />
      <div className="mt-8 flex flex-wrap gap-3">
        {items.map((area, index) =>
          area.href ? (
            <Link
              key={`${area.label}-${index}`}
              href={area.href}
              className="border border-line px-4 py-2.5 text-sm font-medium text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
            >
              {area.label}
            </Link>
          ) : (
            <span
              key={`${area.label}-${index}`}
              className="border border-line px-4 py-2.5 text-sm font-medium text-ink-2/75"
            >
              {area.label}
            </span>
          ),
        )}
      </div>
    </Section>
  )
}
