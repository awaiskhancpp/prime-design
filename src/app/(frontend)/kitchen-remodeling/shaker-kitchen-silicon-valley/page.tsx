import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'

export const metadata: Metadata = { title: 'Shaker Kitchens | Prime Design & Build', description: 'Discover simple, functional, and timeless Shaker kitchen remodeling in Silicon Valley.' }
export default function ShakerKitchenRoute() { return <ServiceDetailPage service={serviceDetails['shaker-kitchen-silicon-valley']} /> }
