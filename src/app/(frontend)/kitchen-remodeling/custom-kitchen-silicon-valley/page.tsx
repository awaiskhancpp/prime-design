import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'

export const metadata: Metadata = { title: 'Custom Kitchens | Prime Design & Build', description: 'Design a custom kitchen tailored to your style, routines, and home with Prime Design & Build.' }
export default function CustomKitchenRoute() { return <ServiceDetailPage service={serviceDetails['custom-kitchen-silicon-valley']} /> }
