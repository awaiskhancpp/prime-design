import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Put the FAQ categories and questions back into the order the WordPress site
 * shows them in.
 *
 * SOURCE. `WORDPRESS_FAQ` below is the live https://primedesignandbuild.com/faq/
 * page, read out of its Bricks accordion markup rather than retyped: each `<h2
 * class="brxe-heading">` is a category and each `x-accordion_header` span under
 * it is a question, in document order. The repo's WXR export contains
 * attachments only, so it is not a usable source for this.
 *
 * What was wrong:
 *
 *   Categories had no order at all. `resolveFaqIndex` sorted them by title,
 *   and this database's collation is `C.UTF-8` — a byte sort, capitals before
 *   lowercase — so "ADU Questions" came out above "About Us Questions". The
 *   WordPress page lists About Us first.
 *
 *   Finance Questions was stored in exactly reverse order, on /faq and on
 *   /services/finance alike.
 *
 *   General Questions had its first two entries swapped.
 *
 *   The "About Us Questions" category was titled "About Questions".
 *
 * Every other category already matched, question for question. This script
 * still rewrites their `sortOrder` from the same source, so the whole set is
 * explicit and 0-based rather than half-set by an old import.
 *
 *   npx tsx scripts/seed-faq-order.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

type WordPressCategory = {
  category: string
  questions: string[]
  /** Entries WordPress lists twice. Recorded here; not created. */
  duplicatedInWordPress?: string[]
}

const WORDPRESS_FAQ: WordPressCategory[] = [
  {
    category: "About Us Questions",
    questions: [
      "What sets Prime Design & Build apart from other kitchen remodeling companies?",
    ],
  },
  {
    category: "ADU Questions",
    questions: [
      "What does the process of designing and building an ADU with Prime Design and Build entail?",
      "Are there specific regulations for building an ADU in my area?",
      "What is an ADU and how can it benefit my property?",
    ],
  },
  {
    category: "Bathroom Remodel Questions",
    questions: [
      "Can you help me select the right fixtures and materials for my bathroom remodel?",
      "How long does a bathroom remodel typically take?",
      "Can you assist me in designing a bathroom that maximizes space?",
      "What are the benefits of remodeling my bathroom?",
    ],
  },
  {
    category: "Complete Renovations Questions",
    questions: [
      "How does Prime Design and Build ensure the renovation reflects my personal style and needs?",
      "How long does a full-scale renovation project typically take?",
      "What exactly does a complete renovation entail with Prime Design and Build?",
    ],
  },
  {
    category: "Custom Kitchen Questions",
    questions: [
      "How involved can I be in the design process of my custom kitchen?",
      "What are the advantages of a custom kitchen?",
      "Can you customize the design of my kitchen according to my specific preferences?",
      "How can I make my kitchen more energy-efficient during the remodel?",
      "How can I maximize storage space in my kitchen remodel?",
    ],
  },
  {
    category: "European Kitchen Questions",
    questions: [
      "Can you help me incorporate European design elements into my kitchen remodel?",
      "What are the key features of a European kitchen design?",
    ],
  },
  {
    category: "Finance Questions",
    questions: [
      "How can I qualify for financing with Prime Design & Build?",
      "What financing options do you offer for kitchen remodels?",
      "Will remodeling a kitchen add value to my home?",
      "How do I finance a kitchen remodel?",
    ],
  },
  {
    category: "General Questions",
    questions: [
      "How can Prime Design & Build help me create my dream kitchen?",
      "Can you help me choose the right materials and finishes for my kitchen remodel?",
      "How long does a kitchen renovation take?",
    ],
    // WordPress repeats this entry verbatim in the same category — same
    // question, byte-identical answer. Recorded, not reproduced.
    duplicatedInWordPress: ["How can Prime Design & Build help me create my dream kitchen?"],
  },
  {
    category: "Home Remodel Questions",
    questions: [
      "How long does a typical home remodeling project take?",
      "Do you provide design services for home remodeling?",
      "Can I make changes to the design or scope of the project once it has started?",
      "What types of home remodeling projects do you specialize in?",
    ],
  },
  {
    category: "Kitchen Remodel Questions",
    questions: [
      "What are the typical stages of a kitchen remodel?",
      "What can I do to plan for a kitchen remodel?",
    ],
  },
  {
    category: "Outdoor Hardscape Questions",
    questions: [
      "Will hardscape increase my property value?",
      "How long does a hardscape project take?",
      "What is included in hardscape services?",
    ],
  },
  {
    category: "Outdoor Kitchen Questions",
    questions: [
      "What materials are best for outdoor kitchens?",
      "Do outdoor kitchens require plumbing, gas, or electrical connections?",
      "What does the outdoor kitchen design and build process involve?",
    ],
  },
  {
    category: "Room Additions Questions",
    questions: [
      "Can Prime Design and Build handle room additions on properties with limited space or unique landscapes?",
      "What factors should I consider before deciding on a room addition?",
    ],
  },
  {
    category: "Shaker Kitchen Questions",
    questions: [
      "Can you create a Shaker-style kitchen with modern elements?",
      "What defines a Shaker kitchen design?",
    ],
  },
  {
    category: "Siding Questions",
    questions: [
      "Is new siding energy-efficient?",
      "How long does siding installation take?",
      "What siding material is best for my home?",
      "How do I know if my siding needs replacement?",
    ],
  },]

/**
 * WordPress heading -> the title the category was stored under before this
 * script renamed it. Only one differed: "About Us Questions" was "About
 * Questions". Looked up second, after the WordPress spelling, so a re-run
 * finds the record it has already renamed.
 */
const PREVIOUS_TITLES: Record<string, string> = {
  'About Us Questions': 'About Questions',
}

/** Questions differ only in apostrophe style between the two sources. */
const normalise = (value: string) => value.replace(/[\u2018\u2019]/g, "'").replace(/\s+/g, ' ').trim()

const payload = await getPayload({ config: configPromise })

const { docs: categoryDocs } = await payload.find({
  collection: 'faq-categories',
  depth: 0,
  limit: 200,
})
const categories = categoryDocs as unknown as Array<{ id: number; title: string }>

const { docs: faqDocs } = await payload.find({ collection: 'faqs', depth: 0, limit: 500 })
const faqs = faqDocs as unknown as Array<{
  id: number
  question: string
  category: number | { id: number }
  sortOrder?: number | null
}>
const categoryOf = (faq: (typeof faqs)[number]) =>
  typeof faq.category === 'object' ? faq.category.id : faq.category

const gaps: string[] = []
let categoryUpdates = 0
let questionUpdates = 0

for (const [index, source] of WORDPRESS_FAQ.entries()) {
  const category =
    categories.find((row) => row.title === source.category) ??
    categories.find((row) => row.title === PREVIOUS_TITLES[source.category])
  if (!category) {
    gaps.push(`no category in Payload for "${source.category}"`)
    continue
  }

  // The order, and the WordPress spelling of the title.
  if (!dryRun) {
    await payload.update({
      collection: 'faq-categories',
      id: category.id,
      data: { sortOrder: index, title: source.category } as never,
    })
  }
  categoryUpdates += 1

  const mine = faqs.filter((faq) => categoryOf(faq) === category.id)
  for (const [position, question] of source.questions.entries()) {
    const match = mine.find((faq) => normalise(faq.question) === normalise(question))
    if (!match) {
      gaps.push(`${source.category}: no FAQ matching "${question}"`)
      continue
    }
    if (match.sortOrder !== position) {
      if (!dryRun) {
        await payload.update({
          collection: 'faqs',
          id: match.id,
          data: { sortOrder: position } as never,
        })
      }
      questionUpdates += 1
      console.log(`  ${source.category}: "${question.slice(0, 55)}…" -> ${position}`)
    }
  }

  // Anything of ours WordPress does not list at all.
  for (const faq of mine) {
    if (!source.questions.some((question) => normalise(question) === normalise(faq.question))) {
      gaps.push(`${source.category}: "${faq.question}" is in Payload but not on the WordPress page`)
    }
  }

  for (const duplicate of source.duplicatedInWordPress ?? []) {
    gaps.push(
      `${source.category}: WordPress lists "${duplicate}" twice (identical answer). Stored once here.`,
    )
  }
}

console.log(`\n${dryRun ? 'would update' : 'updated'} ${categoryUpdates} categories, ${questionUpdates} questions`)
if (gaps.length) {
  console.log('\nGAPS:')
  for (const gap of gaps) console.log(`  - ${gap}`)
}

process.exit(0)
