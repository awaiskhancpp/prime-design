import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'

export type Service = {
  slug: string
  title: string
  description: string
  image: string
  showInConsultationForm?: boolean
}

export type ServiceDetail = Service & {
  eyebrow: string
  lead: string
  keyFeatures: string[]
  benefits: string[]
  process: string[]
  gallery: string[]
  introHeading?: string
  heroVideoUrl?: string
  contentBlocks?: ServiceContentBlock[]
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
    ogTitle?: string | null
    ogDescription?: string | null
  }
}

export type ServiceContentItem = { text: string }
export type ServiceContentStep = { title: string; description: string; image?: string }
export type ServiceContentBlock =
  | {
      blockType: 'intro'
      eyebrow?: string
      heading: string
      body: string
      image?: string
      imageSide?: 'left' | 'right'
      items?: ServiceContentItem[]
    }
  | {
      blockType: 'image-text'
      eyebrow?: string
      heading: string
      body: string
      image?: string
      imageSide?: 'left' | 'right'
      items?: ServiceContentItem[]
    }
  | { blockType: 'feature-list'; heading: string; items: ServiceContentItem[] }
  | { blockType: 'benefits'; heading: string; items: ServiceContentItem[] }
  | { blockType: 'process'; heading: string; steps: ServiceContentStep[] }
  | { blockType: 'gallery'; heading?: string; images: string[] }
  | {
      blockType: 'sub-services'
      heading: string
      items: Array<{ title: string; description: string; image?: string; link?: string }>
    }
  | { blockType: 'video'; heading?: string; videoUrl: string; poster?: string }
  | { blockType: 'quote'; quote: string; attribution?: string }
  | {
      blockType: 'icon-feature-list'
      heading: string
      intro?: string
      image?: string
      imageSide?: 'left' | 'right'
      items: Array<{ title: string; description: string }>
    }
  | {
      blockType: 'checklist'
      eyebrow?: string
      heading: string
      description?: string
      image?: string
      imageSide?: 'left' | 'right'
      items: ServiceContentItem[]
    }

const kitchen = '/services/kitchen-remodeling.jpeg'
const home = '/services/home-remodeling.jpeg'
const beforeAfter = '/before-after/complete_remodeling_after.jpeg'
const bathroom = '/before-after/bathroom_remodeling_after.jpeg'

export const services: Service[] = [
  {
    slug: 'adu',
    title: 'ADU',
    description:
      'Our team specializes in creating versatile and functional Accessory Dwelling Units that provide homeowners with additional living space or rental opportunities.',
    image: home,
  },
  {
    slug: 'additions',
    title: 'Additions',
    description:
      'Our home addition services are tailored to help you expand and enhance your living space without the hassle of moving.',
    image: home,
  },
  {
    slug: 'complete-renovation',
    title: 'New Construction / Complete Renovation',
    description:
      'We specialize in bringing your dream home to life with custom-built homes, thoughtful design, and careful construction.',
    image: beforeAfter,
  },
  {
    slug: 'kitchen-remodeling',
    title: 'Kitchen Remodeling',
    description:
      'Experience the transformation of your home with our kitchen remodeling service, from concept to completion.',
    image: kitchen,
  },
  {
    slug: 'european-kitchen',
    title: 'European Kitchens',
    description:
      'Indulge in the allure of European kitchens with refined design, precision, and innovation.',
    image: kitchen,
  },
  {
    slug: 'shaker-kitchens',
    title: 'Shaker Kitchens',
    description:
      'Discover the timeless beauty of Shaker kitchens with classic simplicity, elegance, and functionality.',
    image: kitchen,
  },
  {
    slug: 'custom-kitchens',
    title: 'Custom Kitchens',
    description:
      'Unleash your creativity with a custom kitchen designed around your preferences and everyday routines.',
    image: kitchen,
  },
  {
    slug: 'bathroom-remodeling',
    title: 'Bathroom Remodeling',
    description:
      'Refresh and reimagine your bathroom with carefully selected fixtures, finishes, and layouts.',
    image: bathroom,
  },
  {
    slug: 'home-remodeling',
    title: 'Home Remodeling',
    description:
      'Transform your home from top to bottom with thoughtful planning and expert construction.',
    image: home,
  },
  {
    slug: 'home-repair-installation-services',
    title: 'Home Repair Services',
    description:
      'Keep your home comfortable, functional, and beautiful with dependable repair and installation services from Prime Design & Build.',
    image: home,
  },
  {
    slug: 'financing',
    title: 'Financing',
    description:
      'Explore flexible financing options to help bring your remodeling vision to life within your budget.',
    image: home,
  },
]

export const serviceDetails: Record<string, ServiceDetail> = {
  adu: {
    ...services[0],
    eyebrow: 'ADU & Garage Conversions',
    lead: 'Transform your existing garage or open space into an ADU that expands what is possible for your property.',
    keyFeatures: [
      'Customized ADU designs tailored to your unique needs and preferences',
      'High-quality construction materials and techniques for long-lasting durability',
      'Sustainable and energy-efficient solutions to minimize environmental impact',
      'Expert guidance through the entire process, from planning to completion',
      'Timely project management and adherence to local building regulations',
    ],
    benefits: [
      'Multifunctional space: Utilize your ADU as a home office, guesthouse, rental unit, or living space for extended family members.',
      'Increased property value: ADUs are highly sought after and can significantly enhance the market value of your property.',
      'Extra income potential: Rent out your ADU to generate additional monthly income and offset your mortgage or other expenses.',
      'Flexible design options: Choose from a range of architectural styles, floor plans, and amenities to create a space that suits your lifestyle.',
    ],
    process: [
      'Initial consultation: Discuss your requirements, budget, and design preferences with our team.',
      'Design and planning: Our experts will create detailed blueprints and design concepts for your ADU.',
      'Construction: Our skilled builders will construct your ADU with attention to detail and quality craftsmanship.',
      'Finishing touches: We add the final fixtures, ensuring your ADU meets your expectations.',
      'Completion and handover: We conduct a thorough inspection and hand over the keys to your beautifully finished ADU.',
    ],
    gallery: [home, kitchen],
  },
  additions: {
    ...services[1],
    eyebrow: 'Home Additions',
    lead: 'Our experienced team works closely with you to understand your needs and create a functional, beautiful addition that seamlessly integrates with the existing structure of your home.',
    introHeading: 'Home Additions — Enhancing Your Living Space',
    keyFeatures: [
      'Customized home addition designs tailored to your unique needs and preferences',
      'Attention to architectural aesthetics and cohesive design to enhance the overall look of your home',
      'Quality construction materials and techniques for a seamless finish',
      'Comprehensive project management from start to finish',
      'Collaborative approach, working closely with you to ensure your vision is reflected in the final result',
    ],
    benefits: [
      'Increased living space: Add more living space to accommodate a growing family, create a dedicated home office, or improve functionality.',
      'Personalization: Tailor the design and layout of your addition to match your unique style and preferences.',
      'Value enhancement: A well-designed and executed addition can significantly increase the value of your property.',
      'Avoiding the cost and stress of moving: Expand your home without the hassle of a full-scale move, allowing you to stay in your beloved neighborhood.',
    ],
    process: [
      'Consultation: Our team will meet with you to understand your goals, requirements, and budget for the home addition project.',
      'Design and Planning: Our expert designers will create detailed plans that integrate seamlessly with your existing home structure, considering aesthetics, functionality, and your specific needs.',
      'Permitting and Approvals: We’ll handle the necessary permits and ensure compliance with local building codes and regulations.',
      'Construction: Our skilled builders will execute the construction phase with attention to detail and craftsmanship, minimizing disruptions to your daily life.',
      'Project Management: We’ll manage the project timeline, coordinate subcontractors, and keep you informed throughout the process.',
      'Finishing Touches: Once the construction is complete, we’ll add the finishing touches, ensuring a cohesive and polished result.',
      'Final Inspection and Handover: We’ll conduct a thorough inspection to ensure quality and address any final details. Then, we’ll hand over your new and enhanced living space.',
    ],
    gallery: [home, beforeAfter],
  },
  'kitchen-remodeling': {
    ...services[3],
    eyebrow: 'Kitchen Remodeling Company in Silicon Valley',
    lead: 'Take a tour through one of our stunning kitchen transformations. From the first sketch to the final reveal, we create kitchens that feel personal, practical, and built to last.',
    introHeading: 'A kitchen designed around the way you live',
    keyFeatures: [
      'A thoughtful layout that makes cooking and gathering easier',
      'Premium cabinetry, countertops, fixtures, and appliances',
      'Clear communication from consultation through final reveal',
      'Efficient project management that respects your home and routine',
    ],
    benefits: [
      'A kitchen that reflects your unique style and personality',
      'Smart storage and thoughtful organization for everyday living',
      'High-quality materials selected for beauty and durability',
      'A seamless design-build experience with one trusted team',
    ],
    process: [
      'Initial consultation: We learn about your goals, taste, budget, and how you use your kitchen.',
      'Customized design: Our designers turn your ideas into a practical, beautiful plan.',
      'Efficient project management: We coordinate every detail and keep you informed.',
      'Skilled craftsmanship: Our team brings the approved design to life with care.',
      'Final reveal: We complete the details and welcome you into your new kitchen.',
    ],
    gallery: [kitchen, home],
  },
  'european-kitchen-silicon-valley': {
    ...services[4],
    slug: 'european-kitchen-silicon-valley',
    eyebrow: 'European Kitchen',
    lead: 'Experience the allure of European kitchens that blend elegance, function, and thoughtful craftsmanship.',
    introHeading: 'What are features of a European Kitchen?',
    keyFeatures: [
      'Modern and sleek designs with clean lines',
      'Rich and charming styles with warm, earthy tones',
      'Contemporary designs featuring minimalist aesthetics',
      'Timeless and classic designs with intricate details',
      'Personalized designs tailored to your preferences',
    ],
    benefits: [
      'Streamlined and minimalist design',
      'Abundance of natural light',
      'Open and airy atmosphere',
      'Focus on functionality and efficiency',
      'Incorporation of smart storage solutions',
    ],
    process: [
      'Share your inspiration and how you want the kitchen to work.',
      'Refine the layout, cabinetry, materials, and finishes with our design team.',
      'Review the complete plan and selections before construction begins.',
      'Our craftspeople install, adjust, and finish every detail with precision.',
    ],
    gallery: [kitchen, home],
    contentBlocks: [
      {
        blockType: 'image-text',
        eyebrow: 'Learn more about European Kitchens',
        heading: 'Transform Your Kitchen Into A Work Of Art',
        body: 'What are features of a European Kitchen? Here are some features that set a European kitchen apart from the rest.',
        image: kitchen,
        imageSide: 'left',
        items: [
          { text: 'Modern and sleek designs with clean lines' },
          { text: 'Rustic and charming styles with warm earthy tones' },
          { text: 'Contemporary designs featuring minimalist aesthetics' },
          { text: 'Timeless and classic designs with intricate details' },
          { text: 'Personalized designs tailored to your preferences' },
        ],
      },
      {
        blockType: 'image-text',
        eyebrow: 'European Kitchen',
        heading: 'Key Elements Of European Kitchens',
        body: "Want to know what really makes European kitchens so great? Here's what gives your kitchen a European charm.",
        image: kitchen,
        imageSide: 'right',
        items: [
          { text: 'Streamlined and minimalist design' },
          { text: 'Abundance of natural light' },
          { text: 'Open and airy atmosphere' },
          { text: 'Focus on functionality and efficiency' },
          { text: 'Incorporation of smart storage solutions' },
        ],
      },

      {
        blockType: 'image-text',
        eyebrow: 'From the ground up',
        heading: 'Premium Materials For European Kitchens',
        body: 'Unleash the beauty and durability of thoughtfully chosen materials.',
        image: home,
        imageSide: 'left',
        items: [
          { text: 'High-quality hardwoods, such as oak, walnut, and beech' },
          { text: 'Stylish glass and metal accents' },
          { text: 'Elegant and durable stone countertops, like marble and granite' },
          { text: 'Sleek and modern stainless steel appliances' },
        ],
      },
    ],
  },
  'shaker-kitchen-silicon-valley': {
    ...services[5],
    slug: 'shaker-kitchen-silicon-valley',
    eyebrow: 'The Shaker Kitchen Aesthetic',
    lead: 'Simple, functional, and crafted with integrity. Discover a timeless kitchen style that balances traditional character with modern living.',
    introHeading: 'What makes a Shaker Kitchen stand out?',
    keyFeatures: [
      'Clean lines and recessed-panel cabinetry',
      'A balanced palette of natural materials and classic finishes',
      'Practical storage designed around your daily routines',
      'Modern appliances paired with timeless craftsmanship',
    ],
    benefits: [
      'Versatile door options that work in traditional or modern homes',
      'Endless finishes and colors to express your style',
      'A kitchen built for everyday use and long-term enjoyment',
      'A flexible design that remains timeless as trends change',
    ],
    process: [
      'Explore the Shaker look and identify the details that speak to you.',
      'Choose cabinetry, hardware, colors, and materials with our design team.',
      'Approve a coordinated design that balances beauty with function.',
      'We build and finish your kitchen with careful attention to every detail.',
    ],
    gallery: [kitchen, kitchen],
  },
  'custom-kitchen-silicon-valley': {
    ...services[6],
    slug: 'custom-kitchen-silicon-valley',
    eyebrow: 'Custom Kitchen',
    lead: 'Custom Kitchens: Designed to Inspire, Built to Amaze. Collaborate with our team to create a kitchen tailored to your exact needs and personal style.',
    introHeading: 'The Power of Customization',
    keyFeatures: [
      'Personalized design developed around your dream kitchen',
      'Superior craftsmanship and high-quality materials',
      'Maximized efficiency and organization through custom features',
      'Express your unique style through every finish and detail',
    ],
    benefits: [
      'Modern sophistication with clean, contemporary forms',
      'Timeless elegance that will look beautiful for years',
      'Rustic refinement with warmth and character',
      'Minimalist elegance with a calm, uncluttered feel',
    ],
    process: [
      'Consultation: We discuss your vision, priorities, and budget.',
      'Design: We create a custom layout, elevations, and material palette.',
      'Selections: You choose the finishes, fixtures, and accents that make it yours.',
      'Build: Our team manages construction and delivers a kitchen crafted to perfection.',
    ],
    gallery: [kitchen, home],
  },
  'complete-renovation': {
    ...services[2],
    eyebrow: 'Complete Renovation',
    lead: 'Our experienced team of architects, designers, and builders is dedicated to creating custom-built homes that reflect your unique style and lifestyle.',
    introHeading: 'A Client-Centered Approach to Home Remodeling',
    keyFeatures: [
      'Comprehensive planning from concept through completion',
      'Design decisions grounded in your lifestyle and needs',
      'Clear communication and reliable project management',
      'Quality construction with careful attention to detail',
    ],
    benefits: [
      'Reimagine your entire home without leaving the neighborhood you love',
      'Coordinate kitchens, bathrooms, living spaces, and exteriors as one vision',
      'Improve comfort, function, efficiency, and long-term value',
      'Rely on one experienced team for design and construction',
    ],
    process: [
      'Free consultation: We understand your vision and priorities.',
      'Customized design: We develop a plan tailored to your home and lifestyle.',
      'Skilled project management: We coordinate people, materials, and timelines.',
      'Quality craftsmanship: We build with care and keep you informed throughout.',
      'Final walkthrough: We make sure every detail meets your expectations.',
    ],
    gallery: [beforeAfter, home],
  },
}

const defaultDetailCopy = {
  keyFeatures: [
    'Thoughtful design tailored to your home and lifestyle',
    'Quality materials selected for lasting beauty and performance',
    'Clear communication from the first consultation through completion',
  ],
  benefits: [
    'A more functional home designed around the way you live',
    'A coordinated design-build experience with one trusted team',
    'Craftsmanship focused on detail, durability, and long-term value',
  ],
  process: [
    'Initial consultation: We learn about your goals, home, and budget.',
    'Customized design: We develop a plan around your needs and style.',
    'Project management: We coordinate the work and keep you informed.',
    'Quality craftsmanship: We build and finish each detail with care.',
  ],
  gallery: [home, kitchen],
}

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  const detail = serviceDetails[slug]
  if (detail) return detail
  const service = services.find((item) => item.slug === slug)
  if (!service) return undefined
  return {
    ...service,
    eyebrow: `${service.title} in Silicon Valley`,
    lead: service.description,
    ...defaultDetailCopy,
  }
}

type PayloadMedia = { url?: string | null }
type PayloadServiceRecord = {
  title: string
  slug: string
  description?: string | null
  shortDescription?: string | null
  hero?: {
    eyebrow?: string | null
    heading?: string | null
    lead?: string | null
    image?: number | PayloadMedia | null
    video?: number | PayloadMedia | null
  } | null
  contentBlocks?: Array<Record<string, unknown>> | null
  seo?: ServiceDetail['seo']
  showInConsultationForm?: boolean | null
}

const payloadImageUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

function normalizePayloadBlocks(
  value: PayloadServiceRecord['contentBlocks'],
): ServiceContentBlock[] | undefined {
  if (!value?.length) return undefined
  return value.flatMap((block): ServiceContentBlock[] => {
    const blockType = block.blockType
    if (blockType === 'intro' || blockType === 'image-text')
      return [
        {
          blockType,
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          body: String(block.body || ''),
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'left' ? 'left' : 'right',
        },
      ] as ServiceContentBlock[]
    if (blockType === 'feature-list' || blockType === 'benefits')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          items: Array.isArray(block.items)
            ? block.items.map((item) => ({
                text: String((item as Record<string, unknown>).text || ''),
              }))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'process')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          steps: Array.isArray(block.steps)
            ? block.steps.map((step) => {
                const item = step as Record<string, unknown>
                return {
                  title: String(item.title || ''),
                  description: String(item.description || ''),
                  image: payloadImageUrl(item.image),
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'gallery')
      return [
        {
          blockType,
          heading: typeof block.heading === 'string' ? block.heading : undefined,
          images: Array.isArray(block.images)
            ? block.images.map(payloadImageUrl).filter((image): image is string => Boolean(image))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'sub-services')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          items: Array.isArray(block.items)
            ? block.items.map((item) => {
                const entry = item as Record<string, unknown>
                return {
                  title: String(entry.title || ''),
                  description: String(entry.description || ''),
                  image: payloadImageUrl(entry.image),
                  link: typeof entry.link === 'string' ? entry.link : undefined,
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'video') {
      const videoUrl =
        payloadImageUrl(block.video) || (typeof block.videoUrl === 'string' ? block.videoUrl : '')
      if (!videoUrl) return []
      return [
        {
          blockType,
          heading: typeof block.heading === 'string' ? block.heading : undefined,
          videoUrl,
          poster: payloadImageUrl(block.poster),
        },
      ] as ServiceContentBlock[]
    }
    if (blockType === 'icon-feature-list')
      return [
        {
          blockType,
          heading: String(block.heading || ''),
          intro: typeof block.intro === 'string' ? block.intro : undefined,
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'right' ? 'right' : 'left',
          items: Array.isArray(block.items)
            ? block.items.map((item) => {
                const entry = item as Record<string, unknown>
                return {
                  title: String(entry.title || ''),
                  description: String(entry.description || ''),
                }
              })
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'checklist')
      return [
        {
          blockType,
          eyebrow: typeof block.eyebrow === 'string' ? block.eyebrow : undefined,
          heading: String(block.heading || ''),
          description: typeof block.description === 'string' ? block.description : undefined,
          image: payloadImageUrl(block.image),
          imageSide: block.imageSide === 'right' ? 'right' : 'left',
          items: Array.isArray(block.items)
            ? block.items.map((item) => ({
                text: String((item as Record<string, unknown>).text || ''),
              }))
            : [],
        },
      ] as ServiceContentBlock[]
    if (blockType === 'quote')
      return [
        {
          blockType,
          quote: String(block.quote || ''),
          attribution: typeof block.attribution === 'string' ? block.attribution : undefined,
        },
      ] as ServiceContentBlock[]
    return []
  }) as unknown as ServiceContentBlock[]
}

export async function resolveServiceDetail(slug: string): Promise<ServiceDetail | undefined> {
  const fallback = getServiceDetail(slug)
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? fallback : undefined
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const record = result.docs[0] as unknown as PayloadServiceRecord | undefined
  if (!record) return shouldUseLocalFallback() ? fallback : undefined
  const base = fallback || {
    slug: record.slug,
    title: record.title,
    description: record.description || record.shortDescription || '',
    image: '/services/home-remodeling.jpeg',
    eyebrow: record.hero?.eyebrow || record.title,
    lead: record.hero?.lead || record.description || record.shortDescription || '',
    heroVideoUrl: payloadImageUrl(record.hero?.video),
    keyFeatures: [],
    benefits: [],
    process: [],
    gallery: [],
  }
  return {
    ...base,
    title: record.hero?.heading || record.title,
    description: record.description || base.description,
    lead: record.hero?.lead || base.lead,
    eyebrow: record.hero?.eyebrow || base.eyebrow,
    image: payloadImageUrl(record.hero?.image) || base.image,
    heroVideoUrl: payloadImageUrl(record.hero?.video) || base.heroVideoUrl,
    contentBlocks: normalizePayloadBlocks(record.contentBlocks),
  }
}

export async function resolveServices(): Promise<Service[]> {
  if (!process.env.DATABASE_URL) return services

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'services',
    sort: 'sortOrder',
    depth: 2,
    limit: 100,
  })

  if (!result.docs.length) return shouldUseLocalFallback() ? services : []

  return (result.docs as unknown as PayloadServiceRecord[]).map((record) => {
    const fallback = services.find((service) => service.slug === record.slug)
    return {
      slug: record.slug,
      title: record.title,
      description: record.description || record.shortDescription || fallback?.description || '',
      image:
        payloadImageUrl(record.hero?.image) || fallback?.image || '/services/home-remodeling.jpeg',
      showInConsultationForm: record.showInConsultationForm ?? true,
    }
  })
}
