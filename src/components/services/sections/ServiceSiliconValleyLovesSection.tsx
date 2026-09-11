import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

export type SiliconValleyLovesProps = {
  eyebrow?: string
  heading?: string
  body?: string
  image?: string
  stats?: Array<{ value?: string; label?: string; detail?: string }>
}

export function ServiceSiliconValleyLovesSection({
  content,
}: {
  content?: SiliconValleyLovesProps
}) {
  // Content comes from Payload only — render nothing without it.
  if (!content?.heading && !content?.body) return null
  const heading = content.heading || ''
  const body = content.body || ''
  const eyebrow = content.eyebrow || ''
  const image = content.image || ''
  const stats = content.stats?.length
    ? content.stats.filter((s) => s.value || s.label || s.detail)
    : []

  return (
    <Section className="">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader eyebrow={eyebrow} title={heading} description={body} />
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/our-projects" variant="outline" size="lg">
              See Our Projects <span aria-hidden>→</span>
            </Button>
            <Button href="/contact" variant="primary" size="lg">
              Contact our team <span aria-hidden>→</span>
            </Button>
          </div>
        </div>

        {image || stats.length ? (
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden">
              {image ? (
                <Image
                  src={image}
                  alt="A recently completed Prime Design & Build remodel"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              ) : null}
            </div>

            {stats.length ? (
              <div className="absolute -bottom-8 left-6 right-6 flex divide-x divide-line border border-line bg-white shadow-sm sm:left-10 sm:right-auto sm:inline-flex">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex-1 px-5 py-4 text-center sm:flex-none sm:px-6"
                  >
                    <p className="font-display text-3xl font-medium text-ink-2">{stat.value}</p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-brass-deep">
                      {stat.label}
                    </p>
                    <p className="text-xs text-ink-2/50">{stat.detail}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </Section>
  )
}
