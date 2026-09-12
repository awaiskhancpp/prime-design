import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'

export type ConsultationType = {
  title: string
  slug: string
  duration: string
  image: string
  bookingUrl: string
}

const fallbackConsultations: ConsultationType[] = [
  {
    title: 'Additions Consultation',
    slug: 'additions',
    duration: '~1 Hour',
    image: '/services/home-remodeling.jpeg',
    bookingUrl: '#contact',
  },
  {
    title: 'Complete Renovation Consultation',
    slug: 'complete-renovation',
    duration: '~1 Hour',
    image: '/before-after/complete_remodeling_after.jpeg',
    bookingUrl: '#contact',
  },
  {
    title: 'ADU / Garage Conversion',
    slug: 'adu',
    duration: '~1 Hour',
    image: '/services/home-remodeling.jpeg',
    bookingUrl: '#contact',
  },
  {
    title: 'New Construction Consultation',
    slug: 'new-construction',
    duration: '~1 Hour',
    image: '/services/home-remodeling.jpeg',
    bookingUrl: '#contact',
  },
  {
    title: 'Kitchen Remodeling Consultation',
    slug: 'kitchen-remodeling',
    duration: '~1 Hour',
    image: '/services/kitchen-remodeling.jpeg',
    bookingUrl: '#contact',
  },
  {
    title: 'Bathroom Remodeling Consultation',
    slug: 'bathroom-remodeling',
    duration: '~1 Hour',
    image: '/before-after/bathroom_remodeling_after.jpeg',
    bookingUrl: '#contact',
  },
]

type PayloadMedia = { url?: string | null }
type PayloadConsultation = Pick<ConsultationType, 'title' | 'slug'> & {
  hero?: { image?: number | PayloadMedia | null } | null
  consultationLabel?: string | null
}

/**
 * WordPress contact page (post 310) card order. The
 * `showInConsultationForm` checkbox decides membership; this array only
 * fixes the display order to match WordPress. Services not listed here
 * (future additions) sort after the WordPress set.
 */
const WP_CONTACT_ORDER = [
  'additions',
  'complete-renovation',
  'adu',
  'new-construction',
  'kitchen-remodeling',
  'bathroom-remodeling',
]

export async function resolveConsultations(): Promise<ConsultationType[]> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? fallbackConsultations : []
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'services',
    // Only checkbox-true services that are NOT child categories (they have
    // no parentService) appear in the consultation list — so future child
    // categories are excluded automatically, no per-service upkeep needed.
    where: {
      and: [
        { showInConsultationForm: { equals: true } },
        { parentService: { exists: false } },
      ],
    },
    sort: 'sortOrder',
    depth: 2,
    limit: 50,
  })

  if (!result.docs.length) return shouldUseLocalFallback() ? fallbackConsultations : []

  const docs = result.docs as unknown as Array<PayloadConsultation & { showInConsultationForm?: boolean }>
  docs.sort((a, b) => {
    const orderA = WP_CONTACT_ORDER.indexOf(a.slug)
    const orderB = WP_CONTACT_ORDER.indexOf(b.slug)
    return (orderA === -1 ? WP_CONTACT_ORDER.length : orderA) - (orderB === -1 ? WP_CONTACT_ORDER.length : orderB)
  })

  return docs.map(
    (item, index) => ({
      // The appointment name: the CMS label ("Kitchen Remodeling
      // Consultation") or the automatic "{Service} Consultation" fallback.
      title: item.consultationLabel || `${item.title} Consultation`,
      slug: item.slug,
      duration: '~1 Hour',
      image:
        typeof item.hero?.image === 'object' && item.hero.image?.url
          ? item.hero.image.url
          : fallbackConsultations.find((fallback) => fallback.slug === item.slug)?.image ||
            fallbackConsultations[index % fallbackConsultations.length].image,
      bookingUrl: '#contact',
    }),
  )
}
