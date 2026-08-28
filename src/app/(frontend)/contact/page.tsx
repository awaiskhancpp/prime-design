import type { Metadata } from 'next'

import { ContactPage } from '@/components/contact/ContactPage'

export const metadata: Metadata = {
  title: 'Contact | Prime Design & Build',
  description:
    'Schedule a free remodeling consultation with Prime Design & Build in Silicon Valley.',
}

export default function ContactRoute() {
  return <ContactPage />
}
