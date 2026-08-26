import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'

export const metadata: Metadata = { title: 'Complete Renovation | Prime Design & Build', description: 'Transform your home with a complete renovation designed and built around your lifestyle.' }
export default function CompleteRenovationRoute() { return <ServiceDetailPage service={serviceDetails['complete-renovation']} /> }
