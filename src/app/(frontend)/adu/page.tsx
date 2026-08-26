import type { Metadata } from 'next'
import { ServiceDetailPage } from '@/components/services/ServiceDetailPage'
import { serviceDetails } from '@/lib/services'
export const metadata: Metadata = { title: 'ADU & Garage Conversions | Prime Design & Build', description: 'Design and build a custom ADU or garage conversion with Prime Design & Build.' }
export default function AduRoute() { return <ServiceDetailPage service={serviceDetails.adu} /> }
