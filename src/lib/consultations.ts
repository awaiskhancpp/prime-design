import { getPayload } from 'payload'

import configPromise from '@payload-config'

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
type PayloadConsultation = Omit<ConsultationType, 'image'> & {
  image?: number | PayloadMedia | null
}

export async function resolveConsultations(): Promise<ConsultationType[]> {
  if (!process.env.DATABASE_URL) return fallbackConsultations
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'consultation-types',
      where: { active: { equals: true } },
      sort: 'sortOrder',
      depth: 1,
      limit: 50,
    })
    if (!result.docs.length) return fallbackConsultations
    return (result.docs as unknown as PayloadConsultation[]).map((item, index) => ({
      ...item,
      image:
        typeof item.image === 'object' && item.image?.url
          ? item.image.url
          : fallbackConsultations[index % fallbackConsultations.length].image,
      bookingUrl: item.bookingUrl || '#contact',
    }))
  } catch {
    return fallbackConsultations
  }
}
