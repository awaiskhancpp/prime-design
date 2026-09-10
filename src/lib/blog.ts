import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from './richText'
import { shouldUseLocalFallback } from './runtime'

export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  categories: string[]
  author: string
  date: string
  heroImage: string
  /** Rich text intro (migrated WordPress posts) or a plain string (static fallbacks). */
  intro?: RichTextValue | string
  sections?: BlogSection[]
  /** Free-form rich text body (migrated WordPress posts). */
  content?: RichTextValue
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
    intro:
      "Have you ever stepped into a home and felt an instant connection, as if the space itself welcomed you? That's the power of designing with intent—a thoughtful approach that blends beauty with purpose, ensuring every detail has meaning. We recently worked on a remarkable 1937 home in Palomar Park, California. The project involved reimagining the second floor to create a master bedroom with a walk in closet and master bathroom while preserving the home's traditional charm. For the homeowners, this house held decades of memories, and our goal was to honor its legacy while creating a space ready for the next chapter.",
    sections: [
      {
        heading: 'The Challenge: Balancing Tradition and Modernity',
        body: "The homeowners wanted their remodeled space to feel fresh and functional without losing its historic character. This meant every decision, from the layout to the materials, had to strike the perfect balance. We rebuilt the upstairs including reconstruction of the existing bathroom to make an impressive master bathroom and dressing room, and refinished the hardwood floors to preserve the details that tied back to the home's 1937 roots. By incorporating traditional elements like marble floors and walls in the bathroom, aged wood vanities and new crown molding for the whole upstairs, we ensured the updated design felt authentic and timeless.",
        image: homeImage,
        imagePosition: 'left',
      },
      {
        heading: '3 Tips for Designing with Intent',
        body: "Whether you're working with a historic home or starting a new build, designing with intent can elevate your project. Here are three practical tips to help you create a space that's as meaningful as it is beautiful. Embrace the home's character: every home has unique features that tell a story—an original fireplace, old wood floors, or a quirky architectural detail—so look for ways to celebrate and integrate these elements into your design. Let function drive the design: no matter how stunning a space looks, it needs to work for your lifestyle, with a thoughtful layout, smart storage solutions, and durable materials that transform a home from simply beautiful to truly livable. Personalize your space: the best designs reflect the people who live in them, so incorporate personal touches, such as family heirlooms, meaningful colors, or custom features, to make the space truly yours.",
        image: kitchenImage,
        imagePosition: 'right',
      },
      {
        heading: 'Why Intentional Design Matters',
        body: "Designing with intent transforms a house into a home. It's about more than just aesthetics—it's about creating a space that feels deeply connected to your story and needs. At Prime Design and Build, we believe every project should start with understanding your vision. We work closely with our clients to ensure the design reflects their personality, values, and lifestyle.",
        image: homeImage,
        imagePosition: 'center',
      },
      {
        heading: "Let's Bring Your Vision to Life",
        body: "If you've been dreaming of a home that feels like a true reflection of you, let's make it happen. Whether it's updating a historic property or starting fresh, we're here to guide you through the process with expertise and care.",
        image: kitchenImage,
        imagePosition: 'left',
      },
    ],
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
    intro:
      "Let's be honest—starting a remodel is thrilling! You've probably envisioned tearing down walls, installing new cabinets, and picking out fresh colors that reflect your style. At Prime Design and Build, we share in your excitement. But before diving into the fun details, we need to talk about something just as crucial: the design.",
    sections: [
      {
        heading: "Don't Pick Up a Hammer Until You've Picked Out a Plan",
        body: "At Prime Design and Build, we like to say, \"Don't pick up a hammer until you've picked out a plan.\" While it may sound a bit cliché, it carries an important message. Starting with a well-thought-out design isn't just important; it's everything. It transforms your grand ideas into a home that truly functions for you and your family.",
        image: kitchenImage,
        imagePosition: 'left',
      },
      {
        heading: 'Why Design Comes First (And Why It Matters More Than You Think)',
        body: "It's easy to get wrapped up in the beautiful details—choosing the perfect tile or the latest countertop style—but none of that matters if the overall layout doesn't suit your lifestyle. We've seen countless projects where stunning materials fell short because the space simply didn't work. A gorgeous kitchen may lack functionality, or a beautifully furnished living room might feel unwelcoming. That's where thoughtful design comes in—it ensures every choice serves a purpose from the very start.",
        image: homeImage,
        imagePosition: 'right',
      },
      {
        heading: 'Skipping Design Can Cost You (Literally and Figuratively)',
        body: "One of the most valuable lessons we share with homeowners is that a solid design saves you money in the long run. You might think you're speeding up the process by skipping the design phase, but without a clear plan, costly changes and rework often follow once construction is underway. A thoughtful design catches problems before they become expensive surprises.",
        image: kitchenImage,
        imagePosition: 'center',
      },
      {
        heading: 'How We Approach Design (And Why It Works)',
        body: "When we begin designing your remodel, we consider not just the immediate needs but how you'll live in that space five, ten, or even twenty years from now. We think about how your kitchen adapts as your family grows, how your storage needs evolve, and how the space continues to serve you well beyond the day the project wraps up.",
        image: homeImage,
        imagePosition: 'left',
      },
      {
        heading: 'Real Stories: When Design Made All the Difference',
        body: "Let's share one of our favorite success stories. We worked with a family who loved to cook and entertain, yet their kitchen was small, cramped, and cut off from the rest of the house. A thoughtful design opened the layout, reconnected the kitchen to the living space, and gave them the room to gather the way they'd always wanted.",
        image: kitchenImage,
        imagePosition: 'right',
      },
      {
        heading: 'The Bottom Line: Start with Design',
        body: "We know you're eager to kick off your remodel—and so are we! But trust us when we say that everything runs smoother when you start with a solid design. It saves you headaches, money, and stress, and most importantly, it ensures the finished space actually works for the way you live.",
        image: homeImage,
        imagePosition: 'center',
      },
    ],
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
    intro:
      "Winter brings its own set of challenges, and as the temperature drops, it's crucial to ensure that your roof is well-prepared to withstand the harsh winter conditions. Prime Design And Build understands the significance of winterizing your roof to prevent damage and maintain the integrity of your home or commercial building. In this comprehensive winterization checklist, we'll guide you through essential steps to prepare your roof for the winter months.",
    sections: [
      {
        heading: 'Gutter Maintenance',
        body: 'Clean gutters are essential for proper water drainage. Leaves, debris, and even ice dams can accumulate in gutters, leading to water backups and potential roof damage. Prime Design And Build recommends clearing gutters and downspouts of any debris to ensure smooth water flow. Installing gutter guards can also help prevent clogs and reduce maintenance efforts.',
        image: homeImage,
        imagePosition: 'left',
      },
      {
        heading: 'Roof Inspection',
        body: 'Before winter arrives, schedule a thorough roof inspection with Prime Design And Build professionals. Identify and address any existing issues such as damaged shingles, leaks, or weak spots. Our experts are trained to detect potential problems early, before they turn into costly winter repairs.',
        image: kitchenImage,
        imagePosition: 'right',
      },
      {
        heading: 'Attic Insulation and Ventilation',
        body: 'A well-insulated and ventilated attic is crucial for preventing ice dams and maintaining a consistent indoor temperature. Prime Design And Build assesses your attic insulation and ventilation to ensure it meets the recommended standards, helping protect your roof and lower energy costs through the colder months.',
        image: homeImage,
        imagePosition: 'center',
      },
      {
        heading: 'Trim Overhanging Branches',
        body: 'Overhanging branches can pose a threat to your roof during winter storms. Heavy snow or ice accumulation on branches may lead to breakage, causing damage to the roof. Prime Design And Build advises trimming overhanging branches to minimize this risk before winter weather sets in.',
        image: kitchenImage,
        imagePosition: 'left',
      },
      {
        heading: 'Snow and Ice Removal Plan',
        body: 'Heavy snow and ice buildup can exert excessive weight on the roof, leading to structural issues. Prime Design And Build helps clients develop a snow and ice removal plan to safely address accumulation when necessary, using techniques that avoid damaging the roof surface.',
        image: homeImage,
        imagePosition: 'right',
      },
      {
        heading: 'Seal Leaks and Gaps',
        body: 'Inspect your roof for any leaks, gaps, or potential entry points for moisture. Prime Design And Build recommends sealing these areas to prevent water infiltration. Proper sealing not only protects your roof but also helps maintain a comfortable and energy-efficient home.',
        image: kitchenImage,
        imagePosition: 'center',
      },
      {
        heading: 'Check Flashing and Chimneys',
        body: 'Inspect flashing around chimneys, vents, and other roof penetrations for signs of wear or damage. Prime Design And Build ensures that flashing is intact and effectively sealed to prevent water intrusion, and that chimney maintenance is addressed before winter use.',
        image: homeImage,
        imagePosition: 'left',
      },
      {
        heading: 'Schedule a Professional Roof Inspection',
        body: 'For a comprehensive winterization plan, schedule a professional roof inspection with Prime Design And Build. Our experts have the knowledge and experience to identify potential issues, recommend solutions, and ensure your roof is winter-ready before the first storm hits.',
        image: kitchenImage,
        imagePosition: 'right',
      },
    ],
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
  intro?: RichTextValue | string | null
  content?: RichTextValue | null
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
  value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date(value)) : ''

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
    categories:
      post.categories?.map((category) => category.name || '').filter(Boolean) ||
      fallback?.categories ||
      [],
    author: author || fallback?.author || 'Prime Design & Build',
    date: displayDate(post.publishedDate) || fallback?.date || '',
    heroImage:
      payloadMediaUrl(post.featuredImage) ||
      fallback?.heroImage ||
      '/services/kitchen-remodeling.jpeg',
    // `undefined` means the payload record has no intro field at all (legacy
    // rows) — only then use the static fallback. `null` is a real "no intro"
    // from WordPress and must not be replaced with the static copy.
    intro: post.intro !== undefined ? post.intro : fallback?.intro,
    content: post.content ?? fallback?.content,
    sections:
      post.sections?.map((section) => ({
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
  if (!process.env.DATABASE_URL)
    return shouldUseLocalFallback() ? getBlogPostBySlug(slug) : undefined
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
