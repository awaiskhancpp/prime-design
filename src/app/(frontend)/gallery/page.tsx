import type { Metadata } from 'next'

import { GalleryPage } from '@/components/gallery/GalleryPage'

export const metadata: Metadata = {
  title: 'Gallery | Prime Design & Build',
  description: 'Explore kitchen, bathroom, ADU, and home addition projects by Prime Design & Build in Silicon Valley.',
}

export default function GalleryRoute() {
  return <GalleryPage />
}
