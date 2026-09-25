import type { Metadata } from 'next'

import { ConsultationGrid } from '@/components/contact/ConsultationGrid'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { Section } from '@/components/ui/Section'
import { resolveConsultations } from '@/lib/consultations'
import { buildSeoMetadata } from '@/lib/seo'
import { resolveSiteSettings } from '@/lib/siteSettings'

export const metadata: Metadata = buildSeoMetadata(
  undefined,
  {
    title: 'Book Online',
    description:
      "Schedule a free consultation for your remodeling project. Whether it's kitchen, bathroom, home renovation, or ADU/garage conversions, book your appointment today!",
  },
  { path: '/book-online' },
)

export default async function BookOnlinePage() {
  const [consultations, settings] = await Promise.all([
    resolveConsultations(),
    resolveSiteSettings(),
  ])

  return (
    <main data-light-chrome className="min-h-screen bg-white">
      <Section className="bg-white pt-32 md:pt-36 lg:pt-40">
        <h1 className="mb-10 text-center font-display text-3xl font-medium leading-tight tracking-tight text-ink-2 md:text-4xl">
          Schedule Your Free Consultation
        </h1>
        <ConsultationGrid
          consultations={consultations}
          phone={settings.phone}
          phoneClean={settings.phoneClean}
        />
      </Section>

      <LandscapingServiceAreas />
    </main>
  )
}
