import Image from 'next/image'

import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

export const siliconValleyLovesContent = {
  heading: 'Silicon Valley Loves Working With Us!',
  body: 'Our company is committed to creating the best experience possible. Call today to get a quote and let’s talk about what you want to build.',
  eyebrow: 'Over 350+ Projects in Silicon Valley',
}

const stats = [
  { value: '4.9', label: 'Google rating', detail: '56 reviews' },
  { value: '4.9', label: 'Yelp rating', detail: '64 reviews' },
  { value: '350+', label: 'Projects completed', detail: 'Across Silicon Valley' },
]

export function ServiceSiliconValleyLovesSection() {
  const { heading, body, eyebrow } = siliconValleyLovesContent

  return (
    <Section className="">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeader eyebrow={eyebrow} title={heading} description={body} />
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/our-projects" variant="outline" size="lg">
              See our projects <span aria-hidden>→</span>
            </Button>
            <Button href="/contact" variant="primary" size="lg">
              Contact our team <span aria-hidden>→</span>
            </Button>
          </div>
        </div>

        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/services/kitchen-remodeling.jpeg"
              alt="A recently completed Prime Design & Build kitchen remodel"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
          </div>

          <div className="absolute -bottom-8 left-6 right-6 flex divide-x divide-line border border-line bg-white shadow-sm sm:left-10 sm:right-auto sm:inline-flex">
            {stats.map((stat) => (
              <div key={stat.label} className="flex-1 px-5 py-4 text-center sm:flex-none sm:px-6">
                <p className="font-display text-3xl font-medium text-ink-2">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-brass-deep">
                  {stat.label}
                </p>
                <p className="text-xs text-ink-2/50">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
