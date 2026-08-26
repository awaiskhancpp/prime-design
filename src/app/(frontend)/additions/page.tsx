import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'
export const metadata: Metadata = { title: 'Home Additions | Prime Design & Build', description: 'Expand your home with a carefully designed and built addition from Prime Design & Build.' }
export default function AdditionsRoute() { return <ServiceDetailPage service={serviceDetails.additions} /> }
