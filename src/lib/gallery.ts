export type GalleryCategory = {
  slug: string
  title: string
  images: string[]
}

const kitchenImages = [
  '/services/kitchen-remodeling.jpeg',
  '/before-after/complete_remodeling_after.jpeg',
  '/services/home-remodeling.jpeg',
  '/before-after/bathroom_remodeling_after.jpeg',
]

const bathroomImages = [
  '/before-after/bathroom_remodeling_after.jpeg',
  '/services/home-remodeling.jpeg',
  '/before-after/bathroom_remodeling_before.jpg',
  '/services/kitchen-remodeling.jpeg',
]

const additionImages = [
  '/services/home-remodeling.jpeg',
  '/services/kitchen-remodeling.jpeg',
  '/before-after/complete_remodeling_after.jpeg',
]

function repeatImages(images: string[], count: number) {
  return Array.from({ length: count }, (_, index) => images[index % images.length])
}

export const galleryCategories: GalleryCategory[] = [
  { slug: 'kitchens', title: 'Our Kitchens', images: repeatImages(kitchenImages, 30) },
  { slug: 'bathrooms', title: 'Our Bathrooms', images: repeatImages(bathroomImages, 24) },
  { slug: 'adu-additions', title: 'ADU & Additions', images: repeatImages(additionImages, 12) },
]
