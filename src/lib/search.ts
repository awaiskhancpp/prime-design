import { listLandingPageSlugs, resolveLandingPage } from './landingPages'
import { resolveServices } from './services'
import { resolveProjects } from './projects'
import { resolveBlogPosts } from './blog'

export type SearchResult = {
  title: string
  url: string
  excerpt?: string
  section: string
}

// Fixed routes that always exist — zero DB dependency, so search never comes
// up empty even if Payload is unreachable.
const staticPages: SearchResult[] = [
  {
    title: 'Home',
    url: '/',
    section: 'Pages',
    excerpt: "Silicon Valley's design-build remodeling team.",
  },
  { title: 'About', url: '/about', section: 'Pages', excerpt: 'Our story and our process.' },
  {
    title: 'Services',
    url: '/services',
    section: 'Pages',
    excerpt: 'Kitchen, bathroom, home, and outdoor remodeling.',
  },
  {
    title: 'Our Projects',
    url: '/our-projects',
    section: 'Pages',
    excerpt: 'Completed remodels and additions.',
  },
  { title: 'Gallery', url: '/gallery', section: 'Pages', excerpt: 'Photos from recent projects.' },
  {
    title: 'Blog',
    url: '/blog',
    section: 'Pages',
    excerpt: 'Remodeling advice and project stories.',
  },
  {
    title: 'FAQs',
    url: '/faq',
    section: 'Pages',
    excerpt: 'Common questions about remodeling and financing.',
  },
  {
    title: 'Team',
    url: '/team',
    section: 'Pages',
    excerpt: 'Meet the people behind Prime Design & Build.',
  },
  {
    title: 'Testimonials',
    url: '/testimonials',
    section: 'Pages',
    excerpt: 'What our clients say.',
  },
  { title: 'Finance', url: '/finance', section: 'Pages', excerpt: 'Flexible financing options.' },
  {
    title: 'Landscaping',
    url: '/landscaping',
    section: 'Pages',
    excerpt: 'Outdoor living and hardscape.',
  },
  {
    title: 'Remodeling Information',
    url: '/remodeling-information',
    section: 'Pages',
    excerpt: 'An overview of our remodeling services.',
  },
  { title: 'Privacy Policy', url: '/privacy-policy', section: 'Pages' },
  {
    title: 'Contact',
    url: '/contact',
    section: 'Pages',
    excerpt: 'Get in touch or request a free consultation.',
  },
]

function titleFromSlug(slug: string) {
  return slug
    .replace(/-information$/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

async function landingPageResults(): Promise<SearchResult[]> {
  return Promise.all(
    listLandingPageSlugs().map(async (slug) => {
      try {
        const page = await resolveLandingPage(slug)
        return {
          title: page?.title || titleFromSlug(slug),
          url: `/${slug}`,
          excerpt: page?.hero?.lead,
          section: 'Landing pages',
        }
      } catch {
        return { title: titleFromSlug(slug), url: `/${slug}`, section: 'Landing pages' }
      }
    }),
  )
}

async function serviceResults(): Promise<SearchResult[]> {
  try {
    const services = await resolveServices()
    return services.map((s) => ({
      title: s.title,
      url: `/services/${s.slug}`,
      excerpt: s.description,
      section: 'Services',
    }))
  } catch {
    return []
  }
}

async function projectResults(): Promise<SearchResult[]> {
  try {
    const projects = await resolveProjects()
    return projects.map((p) => ({
      title: p.title,
      url: `/project/${p.slug}`,
      excerpt: p.summary || p.description,
      section: 'Projects',
    }))
  } catch {
    return []
  }
}

async function blogResults(): Promise<SearchResult[]> {
  try {
    const posts = await resolveBlogPosts()
    return posts.map((p) => ({
      title: p.title,
      url: `/blog/${p.slug}`,
      excerpt: p.excerpt,
      section: 'Blog',
    }))
  } catch {
    return []
  }
}

/** Simple, dependency-free AND-of-words substring search across the whole site. */
export async function searchSite(query: string): Promise<SearchResult[]> {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean)
  if (!words.length) return []

  const [services, projects, posts, landingPages] = await Promise.all([
    serviceResults(),
    projectResults(),
    blogResults(),
    landingPageResults(),
  ])

  const index = [...staticPages, ...landingPages, ...services, ...projects, ...posts]

  return index
    .map((item) => {
      const title = item.title.toLowerCase()
      const haystack = `${title} ${(item.excerpt || '').toLowerCase()}`
      const matched = words.filter((word) => haystack.includes(word))
      if (matched.length !== words.length) return null
      const score = matched.reduce((total, word) => total + (title.includes(word) ? 2 : 1), 0)
      return { item, score }
    })
    .filter((entry): entry is { item: SearchResult; score: number } => entry !== null)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}
