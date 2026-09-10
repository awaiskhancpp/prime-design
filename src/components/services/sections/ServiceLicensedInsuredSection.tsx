import Image from 'next/image'

import { Section } from '@/components/ui/Section'

/**
 * "Pick a company you can trust" — the Finance page's Licensed / Bonded /
 * Insured section, matching the WordPress design: a primary (dark)
 * background with the centered heading + "Prime Kitchens is fully:" line
 * and three icon cards (SVG + title) below. Icons and titles are authored
 * on the CMS block.
 */
export type LicensedInsuredItem = { title: string; icon?: string }

export function ServiceLicensedInsuredSection({
  heading,
  description,
  items,
}: {
  heading: string
  description?: string
  items?: LicensedInsuredItem[]
}) {
  return (
    <Section className="relative bg-ink text-white">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight md:text-5xl">{heading}</h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-white/75 md:text-lg">{description}</p>
        ) : null}
      </div>

      <div className="mt-12 grid justify-items-center gap-10 sm:grid-cols-3">
        {(items ?? []).map((item) => (
          <div key={item.title} className="flex flex-col items-center gap-5 text-center">
            {item.icon ? (
              <Image
                src={item.icon}
                alt=""
                aria-hidden="true"
                width={96}
                height={96}
                className="h-24 w-auto object-contain"
              />
            ) : null}
            <h3 className="font-display text-xl font-medium text-white">{item.title}</h3>
          </div>
        ))}
      </div>
    </Section>
  )
}
