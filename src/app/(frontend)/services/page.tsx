import type { Metadata } from 'next'
import { ServicesPage } from '@/components/services/ServicesPage'
export const metadata: Metadata = { title: 'Services | Prime Design & Build', description: 'Explore remodeling, construction, kitchen, bathroom, ADU, and home addition services from Prime Design & Build.' }
export default function ServicesRoute() { return <ServicesPage /> }
