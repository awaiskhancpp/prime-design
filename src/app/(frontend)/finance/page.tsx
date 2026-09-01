import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ServiceTemplate } from '@/components/services/ServiceTemplate'
import { resolveServiceDetail } from '@/lib/services'

export const metadata: Metadata = {
  title: 'Flexible Financing for Home Remodeling | Prime Design & Build',
  description:
    'Explore flexible financing options to help bring your remodeling vision to life within your budget.',
}

export default async function FinanceRoute() {
  const service = await resolveServiceDetail('financing')
  if (!service) notFound()

  return <ServiceTemplate service={service} />
}
