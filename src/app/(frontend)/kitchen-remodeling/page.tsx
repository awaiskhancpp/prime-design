import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'

export const metadata: Metadata = { title: 'Kitchen Remodeling | Prime Design & Build', description: 'Create a kitchen designed around your life with Prime Design & Build in Silicon Valley.' }
export default function KitchenRemodelingRoute() { return <ServiceDetailPage service={serviceDetails['kitchen-remodeling']} /> }
