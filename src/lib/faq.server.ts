import { faqCategories, type FaqItem } from './faq'
import type { RichTextValue } from './richText'

export const serviceFaqCategories: Record<string, { description: string; categoryTitle: string }> = {
  'kitchen-remodeling': {
    description:
      'Do you have a kitchen project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    categoryTitle: 'Kitchen Remodel Questions',
  },
  'custom-kitchen': {
    description:
      'Planning a custom kitchen? Bring a clear idea or a rough sketch—we’ll sit down with you at the studio or at your house and map the project from there.',
    categoryTitle: 'Custom Kitchen Questions',
  },
  'european-kitchen': {
    description:
      'Curious about a European kitchen? Start with a conversation. We’ll walk through how the style can work in your home and what the remodel involves.',
    categoryTitle: 'European Kitchen Questions',
  },
  'shaker-kitchen': {
    description:
      'Considering a Shaker kitchen? We’ll help you decide how traditional or contemporary the look should be, then plan the remodel around that choice.',
    categoryTitle: 'Shaker Kitchen Questions',
  },
  'bathroom-remodeling': {
    description:
      'Do you have a bathroom project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    categoryTitle: 'Bathroom Remodel Questions',
  },
  'home-remodeling': {
    description:
      'Do you have a home remodeling project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    categoryTitle: 'Home Remodel Questions',
  },
  'complete-renovation': {
    description:
      'Thinking about a complete renovation? We’ll start with a conversation about how you live now and what you want the house to become.',
    categoryTitle: 'Complete Renovations Questions',
  },
  adu: {
    description:
      'Considering an ADU? We’ll review your property, local rules, and how you want to use the new space before any design work begins.',
    categoryTitle: 'ADU Questions',
  },
  additions: {
    description:
      'Planning a room addition? We’ll look at how the new space should connect to your home, then help you think through layout, budget, and next steps.',
    categoryTitle: 'Room Additions Questions',
  },
  finance: {
    description:
      'Need help funding a remodel? Here are the questions homeowners ask most often about paying for the work.',
    categoryTitle: 'Finance Questions',
  },
}

export async function getFaqItems(categoryTitle: string): Promise<FaqItem[]> {
  const staticItems = faqCategories.find((category) => category.title === categoryTitle)?.items
  if (!process.env.DATABASE_URL) return staticItems ?? []
  try {
    const { getPayload } = await import('payload')
    const configPromise = (await import('@payload-config')).default
    const payload = await getPayload({ config: configPromise })
    const category = await payload.find({
      collection: 'faq-categories',
      where: { title: { equals: categoryTitle } },
      depth: 0,
      limit: 1,
    })
    const catId = (category.docs[0] as { id?: number | string } | undefined)?.id
    if (!catId) return staticItems ?? []
    const faqs = await payload.find({
      collection: 'faqs',
      where: { category: { equals: catId } },
      sort: 'sortOrder',
      depth: 0,
      limit: 200,
    })
    const items = (faqs.docs as Array<{ question?: string; answer?: unknown }>)
      .filter((doc) => doc.question && doc.answer)
      .map((doc) => ({ question: doc.question as string, answer: doc.answer as RichTextValue }))
    return items.length ? items : staticItems ?? []
  } catch {
    return staticItems ?? []
  }
}
