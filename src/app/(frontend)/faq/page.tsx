import type { Metadata } from 'next'

import { FaqPage } from '@/components/faq/FaqPage'

export const metadata: Metadata = {
  title: 'FAQs | Prime Design & Build',
  description: 'Answers to common questions about remodeling, design, construction, and financing with Prime Design & Build.',
}

export default function FaqRoute() {
  return <FaqPage />
}
