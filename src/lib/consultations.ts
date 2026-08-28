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
}

export async function resolveConsultations(): Promise<ConsultationType[]> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? fallbackConsultations : []
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'services',
    where: { showInConsultationForm: { equals: true } },
    sort: 'sortOrder',
    depth: 2,
    limit: 50,
  })

  if (!result.docs.length) return shouldUseLocalFallback() ? fallbackConsultations : []

  return (result.docs as unknown as Array<PayloadConsultation & { showInConsultationForm?: boolean }>).map(
    (item, index) => ({
      title: item.title,
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
