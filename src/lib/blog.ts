import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  categories: string[]
  author: string
  date: string
  heroImage: string
  intro?: string
  sections?: BlogSection[]
  seo?: {
    metaTitle?: string | null
    metaDescription?: string | null
    canonicalUrl?: string | null
    noIndex?: boolean | null
  }
}

export type BlogSection = {
  eyebrow?: string
  heading: string
  body: string
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right' | 'center'
}

const kitchenImage = '/services/kitchen-remodeling.jpeg'
const homeImage = '/services/home-remodeling.jpeg'

export const blogPosts: BlogPost[] = [
  {
    slug: 'cabinetry-done-right-exclusive-seminar',
    title: 'Cabinetry Done Right: Highlights from Our Exclusive Cabinetry Seminar',
    excerpt:
      "If there's one thing we know at Prime Design & Build, it's that a well-crafted cabinet is more than just storage.",
    categories: ['Bathroom Remodeling', 'Home Remodeling', 'Kitchen Remodeling'],
    author: 'Prime Design & Build',
    date: 'November 3, 2023',
    heroImage: kitchenImage,
    intro:
      "If there's one thing we know at Prime Design & Build, it's that a well-crafted cabinet is more than just storage; it's an essential part of a thoughtfully designed home. To share that perspective, we recently hosted an exclusive cabinetry seminar for our design and build team.",
    sections: [
      {
        eyebrow: 'Vision & Concept Development',
        heading: 'The Cabinetry Installation Process: Key Takeaways',
        body: 'A successful cabinetry project starts with a strong design vision. Our in-house designers, who recently underwent advanced training, shared their expertise in understanding client needs, space planning, and aesthetic considerations. Attendees learned how the design process begins with high-quality digital renderings and detailed plans, giving homeowners the confidence to approve every detail before installation.',
        image: homeImage,
        imageAlt: 'Prime Design & Build team reviewing a cabinetry plan',
        imagePosition: 'center',
      },
      {
        eyebrow: 'Detailed Planning & Precision Measurements',
        heading: 'Every detail is planned before the first cabinet arrives',
        body: 'Once the concept is finalized, precision planning is critical. Our seminar emphasized the value of site measurements, material selections, and sequencing the installation around existing finishes. This careful preparation creates a smoother build, protects the home, and keeps the finished cabinetry aligned with the approved design.',
        image: kitchenImage,
        imageAlt: 'Cabinetry materials and installation details',
        imagePosition: 'right',
      },
      {
        eyebrow: 'Seamless Collaboration Between Design & Installation',
        heading: 'Design and build work best as one conversation',
        body: 'A well-executed design relies on expert craftsmanship. Our designers and installers shared their experiences collaborating closely from the initial concept through final adjustments. This teamwork helps identify practical considerations early, resulting in cabinetry that looks beautiful, functions smoothly, and feels at home in the space.',
        image: homeImage,
        imageAlt: 'Team members collaborating during a remodel',
        imagePosition: 'left',
      },
      {
        eyebrow: 'Quality Control & Fine-Tuning Details',
        heading: 'The last ten percent makes the finished room feel complete',
        body: 'Exceptional cabinetry requires meticulous attention to detail. From alignment and hardware placement to finish quality and final adjustments, every stage is reviewed before the project is complete. These small details are what make the cabinetry feel intentional and durable for years to come.',
        image: kitchenImage,
        imageAlt: 'Close-up of cabinetry craftsmanship',
        imagePosition: 'center',
      },
      {
        eyebrow: 'Personalized Finishing Touches',
        heading: 'Your home should feel designed around the way you live',
        body: 'Design is in the details. Our team considers how every drawer, finish, and hardware choice supports the homeowner’s routines and personal style. The result is cabinetry that is not only beautiful, but also genuinely useful every day.',
        image: homeImage,
        imageAlt: 'Craftsperson adding finishing touches to a remodel',
        imagePosition: 'right',
      },
    ],
  },
  {
    slug: 'designing-with-intent',
    title: 'Designing with Intent: Creating Homes That Tell a Story',
    excerpt:
      "Have you ever stepped into a home and felt an instant connection, as if the space itself welcomed you? That's...",
    categories: ['Bathroom Remodeling', 'Home Remodeling'],
    author: 'Tahor R Graves',
    date: 'November 3, 2023',
    heroImage: homeImage,
  },
  {
    slug: 'design-first-thoughtful-plan',
    title: 'Design First: Why a Thoughtful Plan is the Key to Your Dream Remodel',
    excerpt:
      "Let's be honest—starting a remodel is thrilling! You've probably envisioned tearing down walls, installing new cabinets, and picking out fresh...",
    categories: ['Home Remodeling', 'Kitchen Remodeling'],
    author: 'Prime Design & Build',
    date: 'November 3, 2023',
    heroImage: kitchenImage,
  },
  {
    slug: 'winterization-checklist-roof',
    title: 'Winterization Checklist: Prepare Your Roof for the Winter with Prime Design And Build',
    excerpt:
      "Winter brings its own set of challenges, and as the temperature drops, it's crucial to ensure that your roof is...",
    categories: ['Home Remodeling'],
    author: 'Prime Design & Build',
    date: 'November 3, 2023',
    heroImage: homeImage,
  },
  {
    slug: 'eco-friendly-kitchen-remodeling-guide',
    title: 'The Ultimate Guide to Eco-Friendly Kitchen Remodeling with Prime Kitchen Remodel',
    excerpt:
      'Welcome to Prime Kitchen Remodel, where we believe that a stunning kitchen renovation can go hand in hand with a...',
    categories: ['Kitchen Remodeling'],
    author: 'Prime Design & Build',
    date: 'November 3, 2023',
    heroImage: kitchenImage,
  },
]

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug)
}

type PayloadMedia = { url?: string | null }
type PayloadBlogPost = {
  title: string
  slug: string
  excerpt?: string | null
  categories?: Array<{ name?: string | null }> | null
  author?: number | { name?: string | null } | null
  publishedDate?: string | null
  featuredImage?: number | PayloadMedia | null
  intro?: string | null
  sections?: Array<{
    eyebrow?: string | null
    heading?: string | null
    body?: string | null
    image?: number | PayloadMedia | null
    imageAlt?: string | null
    imagePosition?: 'left' | 'right' | 'center' | null
  }> | null
  seo?: {
    meta_title?: string | null
    meta_description?: string | null
    canonical_url?: string | null
    no_index?: boolean | null
  } | null
}

const payloadMediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

const displayDate = (value: string | null | undefined) =>
  value
    ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(value))
    : ''

function normalizePost(post: PayloadBlogPost): BlogPost {
  const fallback = getBlogPostBySlug(post.slug)
  const author =
    typeof post.author === 'object' && post.author !== null && 'name' in post.author
      ? post.author.name
      : undefined
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || fallback?.excerpt || '',
    categories: post.categories?.map((category) => category.name || '').filter(Boolean) || fallback?.categories || [],
    author: author || fallback?.author || 'Prime Design & Build',
    date: displayDate(post.publishedDate) || fallback?.date || '',
    heroImage: payloadMediaUrl(post.featuredImage) || fallback?.heroImage || '/services/kitchen-remodeling.jpeg',
    intro: post.intro || fallback?.intro,
    sections: post.sections?.map((section) => ({
      eyebrow: section.eyebrow || undefined,
      heading: section.heading || '',
      body: section.body || '',
      image: payloadMediaUrl(section.image),
      imageAlt: section.imageAlt || undefined,
      imagePosition: section.imagePosition || 'center',
    })) || fallback?.sections,
    seo: post.seo
      ? {
          metaTitle: post.seo.meta_title,
          metaDescription: post.seo.meta_description,
          canonicalUrl: post.seo.canonical_url,
          noIndex: post.seo.no_index,
        }
      : fallback?.seo,
  }
}

export async function resolveBlogPosts(): Promise<BlogPost[]> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? blogPosts : []
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'blog',
    where: { status: { equals: 'published' } },
    sort: '-publishedDate',
    depth: 2,
    limit: 100,
  })
  if (!result.docs.length) return shouldUseLocalFallback() ? blogPosts : []
  return (result.docs as unknown as PayloadBlogPost[]).map(normalizePost)
}

export async function resolveBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? getBlogPostBySlug(slug) : undefined
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'blog',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    depth: 2,
    limit: 1,
  })
  const record = result.docs[0] as unknown as PayloadBlogPost | undefined
  if (record) return normalizePost(record)
  return shouldUseLocalFallback() ? getBlogPostBySlug(slug) : undefined
}
