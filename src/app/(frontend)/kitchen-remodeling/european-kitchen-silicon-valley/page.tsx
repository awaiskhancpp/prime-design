import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'

export const metadata: Metadata = { title: 'European Kitchens | Prime Design & Build', description: 'Explore elegant, functional European kitchen design and remodeling in Silicon Valley.' }
export default function EuropeanKitchenRoute() { return <ServiceDetailPage service={serviceDetails['european-kitchen-silicon-valley']} /> }
