import { getPayload } from 'payload'

import configPromise from '@payload-config'
import { shouldUseLocalFallback } from './runtime'

export type ProjectVideo = {
  url: string
  title?: string
  projectManager?: string
}

export type Project = {
  slug: string
  title: string
  location: string
  category: string
  summary: string
  description: string
  heroImage: string
  gallery: string[]
  video?: ProjectVideo
}

const kitchen = '/services/kitchen-remodeling.jpeg'
const home = '/services/home-remodeling.jpeg'
const remodel = '/before-after/complete_remodeling_after.jpeg'

export const projects: Project[] = [
  {
    slug: 'designing-with-intent-creating-homes-that-tell-a-story',
    title: 'Designing With Intent: Creating Homes That Tell a Story',
    location: 'Redwood City, California',
    category: 'Complete Home Remodeling',
    summary: 'A thoughtful renovation shaped around the way this family lives, gathers, and grows.',
    description:
      'This project brings design, planning, and construction together to create a home with a clear point of view and an easy everyday rhythm.',
    heroImage: home,
    gallery: [home, kitchen, remodel],
  },
  {
    slug: 'mountain-view-beautiful-kitchen-remodel',
    title: 'Mountain View Beautiful Kitchen Remodel',
    location: 'Mountain View, California',
    category: 'Kitchen Remodeling',
    summary: 'A bright, functional kitchen renovation with a refined material palette.',
    description:
      'The new layout improves flow between cooking, dining, and entertaining while adding durable finishes built for daily life.',
    heroImage: kitchen,
    gallery: [kitchen, home, kitchen],
  },
  {
    slug: 'atherton-kitchen-remodeling-projects',
    title: 'Atherton Kitchen Remodeling Projects',
    location: 'Atherton, California',
    category: 'Kitchen Remodeling',
    summary: 'A tailored kitchen transformation with generous workspace and understated detail.',
    description:
      'Every finish and fixture was selected to balance the character of the home with the needs of a modern household.',
    heroImage: kitchen,
    gallery: [kitchen, home, remodel],
    video: {
      url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/03.09.2024%20Noam%20Prime%2041%20Rosewood%20Dr%20Atherton.mp4',
      title: 'Rosewood Dr, Atherton',
      projectManager: 'Noam',
    },
  },
  {
    slug: 'pleasanton-kitchen-remodel',
    title: 'Pleasanton Kitchen Remodel',
    location: 'Pleasanton, California',
    category: 'Kitchen Remodeling',
    summary: 'A welcoming kitchen designed for cooking, conversation, and connection.',
    description:
      'The renovation creates a more open, useful kitchen while keeping the home warm and comfortable.',
    heroImage: kitchen,
    gallery: [kitchen, remodel, home],
  },
  {
    slug: 'morgan-hill-full-home-remodel',
    title: 'Morgan Hill Full Home Remodel',
    location: 'Morgan Hill, California',
    category: 'Complete Home Remodeling',
    summary: 'A whole-home update that gives every room a more cohesive point of view.',
    description:
      'The team coordinated improvements across the home to make the finishes, lighting, and circulation feel intentional from room to room.',
    heroImage: home,
    gallery: [home, kitchen, remodel],
    video: {
      url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4',
      title: 'Bluebonnet Ct, Morgan Hill (Full House)',
      projectManager: 'Josef',
    },
  },
  {
    slug: 'san-rafael-decking-project',
    title: 'San Rafael Decking Project',
    location: 'San Rafael, California',
    category: 'Outdoor Living',
    summary: 'An outdoor space made for slower mornings and longer evenings.',
    description:
      'Careful planning and durable materials turn an underused exterior into a natural extension of the home.',
    heroImage: remodel,
    gallery: [remodel, home, kitchen],
  },
  {
    slug: 'full-home-remodeling-los-gatos',
    title: 'New Home Construction Los Gatos',
    location: 'Los Gatos, California',
    category: 'New Construction',
    summary: 'A new home shaped around comfort, light, and lasting materials.',
    description:
      'From early planning through the final finish, the project brings the design and build process together under one team.',
    heroImage: home,
    gallery: [home, kitchen, remodel],
  },
  {
    slug: 'sunnyvale-complete-home-renovation',
    title: 'Sunnyvale Complete Home Renovation',
    location: 'Sunnyvale, California',
    category: 'Complete Home Remodeling',
    summary: 'A considered renovation that makes the home brighter, calmer, and easier to use.',
    description:
      'The updated home combines practical planning with a restrained palette and details that will age gracefully.',
    heroImage: home,
    gallery: [home, remodel, kitchen],
  },
  {
    slug: 'san-mateo-complete-home-remodel',
    title: 'San Mateo Complete Home Remodel',
    location: 'San Mateo, California',
    category: 'Complete Home Remodeling',
    summary:
      'A complete remodel covering the kitchen, two bathrooms, interior and exterior paint, and flooring.',
    description:
      'This San Mateo home was renewed from the inside out with a bright kitchen, refreshed bathrooms, cohesive paint, and new flooring throughout.',
    heroImage: kitchen,
    gallery: [kitchen, kitchen, kitchen, kitchen, kitchen, kitchen],
  },
  {
    slug: 'full-home-remodeling-cupertino',
    title: 'Full Home Remodeling Cupertino',
    location: 'Cupertino, California',
    category: 'Complete Home Remodeling',
    summary: 'A full-home transformation built around clean lines and everyday function.',
    description:
      'The renovation updates the home as a whole, making each space feel connected while preserving its sense of welcome.',
    heroImage: kitchen,
    gallery: [kitchen, home, remodel],
  },
  {
    slug: 'full-home-remodel-mountain-view',
    title: 'Full Home Remodel Mountain View',
    location: 'Mountain View, California',
    category: 'Complete Home Remodeling',
    summary:
      'A grounded renovation with durable finishes and a more natural connection between rooms.',
    description:
      'The team focused on improving the home’s flow, light, and storage while keeping the design personal and practical.',
    heroImage: home,
    gallery: [home, kitchen, remodel],
  },
  {
    slug: 'kitchen-remodeling-hayward',
    title: 'Kitchen Remodeling Hayward',
    location: 'Hayward, California',
    category: 'Kitchen Remodeling',
    summary: 'A hardworking kitchen made brighter, more efficient, and easier to enjoy.',
    description:
      'The redesigned kitchen brings storage, circulation, and finish details into a more comfortable balance.',
    heroImage: kitchen,
    gallery: [kitchen, remodel, home],
  },
  {
    slug: 'san-jose-complete-home-remodel',
    title: 'San Jose Complete Home Remodel',
    location: 'San Jose, California',
    category: 'Complete Home Remodeling',
    summary:
      'A coordinated home update that pairs practical improvements with a clean, lasting design.',
    description:
      'The project brings together multiple spaces and scopes under one clear plan, from the first design conversation to completion.',
    heroImage: kitchen,
    gallery: [kitchen, home, remodel],
  },
  {
    slug: 'home-remodeling-sunnyvale',
    title: 'Home Remodeling Sunnyvale',
    location: 'Sunnyvale, California',
    category: 'Home Remodeling',
    summary: 'A more open, useful, and welcoming home for everyday life.',
    description:
      'Thoughtful planning and careful execution make the updated home feel both fresh and familiar.',
    heroImage: home,
    gallery: [home, kitchen, remodel],
  },
  {
    slug: 'bathroom-home-remodel-in-san-jose',
    title: 'Bathroom & Home Remodel in San Jose',
    location: 'San Jose, California',
    category: 'Bathroom Remodeling',
    summary: 'A refined bathroom update paired with improvements across the home.',
    description:
      'The renovation combines comfort, function, and carefully selected finishes to create a calmer daily routine.',
    heroImage: remodel,
    gallery: [remodel, kitchen, home],
  },
  {
    slug: 'complete-remodel-kitchen-and-two-bathrooms-interior-and-exterior-paint-and-flooring-in-san-mateo',
    title:
      'Complete Remodel: Kitchen and Two Bathrooms, Plus Interior and Exterior Paint and Flooring in San Mateo',
    location: 'San Mateo, California',
    category: 'Complete Home Remodeling',
    summary:
      'A complete remodel covering the kitchen and two bathrooms, plus interior and exterior paint and flooring.',
    description:
      'We remodeled the kitchen and two bathrooms, refreshed the interior and exterior paint, and installed new flooring throughout the home. The result is a brighter, more cohesive space designed for many years of daily life.',
    heroImage: kitchen,
    gallery: [kitchen, kitchen, kitchen, kitchen, kitchen, kitchen],
  },
  {
    slug: 'kitchen-remodel-mountain-view',
    title: 'Kitchen Remodel Mountain View',
    location: 'Mountain View, California',
    category: 'Kitchen Remodeling',
    summary: 'A kitchen remodel that pairs crisp finishes with a generous, family-friendly layout.',
    description:
      'The updated kitchen creates room to cook, gather, and move comfortably while bringing the home a more cohesive visual language.',
    heroImage: kitchen,
    gallery: [kitchen, home, remodel],
    video: {
      url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4',
      title: 'Alice Ave, Mountain View (Kitchen)',
      projectManager: 'Ilay',
    },
  },
  {
    slug: 'beautiful-kitchen-remodel-completed-december-2021',
    title: 'Beautiful Kitchen Remodel Completed December 2021',
    location: 'San Jose, California',
    category: 'Kitchen Remodeling',
    summary: 'A warm, detailed kitchen renovation completed with a focus on quality and longevity.',
    description:
      'The final kitchen balances efficient storage and thoughtful details with a welcoming material palette.',
    heroImage: kitchen,
    gallery: [kitchen, remodel, home],
  },
]

export function getProjectBySlug(slug: string) {
  return projects.find((project) => project.slug === slug)
}

type PayloadMedia = { url?: string | null }
type PayloadProject = {
  title: string
  slug: string
  location?: string | null
  category?: string | null
  summary?: string | null
  description?: string | null
  featuredImage?: number | PayloadMedia | null
  gallery?: Array<number | PayloadMedia> | null
  videoUrl?: string | null
}

const payloadMediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

function normalizeProject(project: PayloadProject): Project {
  const fallback = getProjectBySlug(project.slug)
  const gallery = project.gallery?.map(payloadMediaUrl).filter((url): url is string => Boolean(url))

  return {
    slug: project.slug,
    title: project.title,
    location: project.location || fallback?.location || '',
    category: project.category || fallback?.category || '',
    summary: project.summary || fallback?.summary || '',
    description: project.description || fallback?.description || '',
    heroImage: payloadMediaUrl(project.featuredImage) || fallback?.heroImage || home,
    gallery: gallery?.length ? gallery : fallback?.gallery || [],
    // When the payload video URL matches the static entry, keep the richer
    // static caption (title + project manager) that was authored for it.
    video: project.videoUrl
      ? fallback?.video?.url === project.videoUrl
        ? fallback.video
        : { url: project.videoUrl, title: project.title }
      : fallback?.video,
  }
}

export async function resolveProjects(): Promise<Project[]> {
  if (!process.env.DATABASE_URL) return shouldUseLocalFallback() ? projects : []

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'projects',
    sort: '-createdAt',
    depth: 2,
    limit: 100,
  })
  return result.docs.length
    ? (result.docs as unknown as PayloadProject[]).map(normalizeProject)
    : shouldUseLocalFallback()
      ? projects
      : []
}

export async function resolveProjectBySlug(slug: string): Promise<Project | undefined> {
  if (!process.env.DATABASE_URL)
    return shouldUseLocalFallback() ? getProjectBySlug(slug) : undefined

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  const record = result.docs[0] as unknown as PayloadProject | undefined

  return record
    ? normalizeProject(record)
    : shouldUseLocalFallback()
      ? getProjectBySlug(slug)
      : undefined
}
