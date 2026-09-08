/**
 * Replaces the ADU page's legacy `image-text` section (which dumped the whole
 * overview as one unstyled paragraph and suppressed the overview section)
 * with the new rich text overview fields — the same copy, properly styled.
 *
 *   npx tsx scripts/set-overview-richtext.ts seed    # seed rich text + drop legacy section
 *   npx tsx scripts/set-overview-richtext.ts clear   # reset fields (keeps sections as-is)
 */
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const { getPayload } = await import('payload')
const configPromise = (await import('@payload-config')).default
const payload = await getPayload({ config: configPromise })

/** A single styled inline text run. `bold: 1` is Lexical's bold format bit. */
const run = (text: string, bold = false) => ({
  type: 'text',
  detail: 0,
  format: bold ? 1 : 0,
  mode: 'normal',
  style: '',
  text,
  version: 1,
})

/** "Label: description" item — bold label + colon, then plain description. */
const labeled = (label: string, description: string) => ({
  type: 'listitem',
  format: '',
  indent: 0,
  version: 1,
  direction: null,
  children: [run(`${label}:`, true), run(` ${description}`)],
})

/** Plain (un-labeled) item. */
const plain = (text: string) => ({
  type: 'listitem',
  format: '',
  indent: 0,
  version: 1,
  direction: null,
  children: [run(text)],
})

/** Wrap items in a Lexical list node. */
const list = (
  items: Array<ReturnType<typeof plain>>,
  listType: 'bullet' | 'number',
) => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: null,
    children: [
      {
        type: 'list',
        children: items.map((item, index) =>
          listType === 'number' ? { ...item, value: index + 1 } : item,
        ),
        listType,
        start: 1,
        tag: listType === 'bullet' ? 'ul' : 'ol',
        format: '',
        indent: 0,
        version: 1,
        direction: null,
      },
    ],
  },
})

/** The original curated ADU overview copy, now as styled rich text. */
const ADU_CONTENT = {
  keyFeatures: list(
    [
      plain('Customized ADU designs tailored to your unique needs and preferences'),
      plain('High-quality construction materials and techniques for long-lasting durability'),
      plain('Sustainable and energy-efficient solutions to minimize environmental impact'),
      plain('Expert guidance through the entire process, from planning to completion'),
      plain('Timely project management and adherence to local building regulations'),
    ],
    'bullet',
  ),
  benefits: list(
    [
      labeled(
        'Multifunctional space',
        'Utilize your ADU as a home office, guesthouse, rental unit, or living space for extended family members.',
      ),
      labeled(
        'Increased property value',
        'ADUs are highly sought after and can significantly enhance the market value of your property.',
      ),
      labeled(
        'Extra income potential',
        'Rent out your ADU to generate additional monthly income and offset your mortgage or living expenses.',
      ),
      labeled(
        'Flexible design options',
        'Choose from a range of architectural styles, floor plans, and amenities to create a space that suits your lifestyle.',
      ),
    ],
    'bullet',
  ),
  process: list(
    [
      labeled(
        'Initial consultation',
        'Discuss your requirements, budget, and design preferences with our team.',
      ),
      labeled(
        'Design and planning',
        'Our experts will create detailed blueprints and obtain necessary permits.',
      ),
      labeled(
        'Construction',
        'Our skilled builders will construct your ADU with attention to detail and quality craftsmanship.',
      ),
      labeled(
        'Finishing touches',
        "We'll add the final touches, ensuring your ADU meets your expectations.",
      ),
      labeled(
        'Completion and handover',
        "We'll conduct a thorough inspection and hand over the keys to your beautifully finished ADU.",
      ),
    ],
    'number',
  ),
}

async function main() {
  const mode = process.argv[2] ?? 'seed'
  const { docs } = await payload.find({
    collection: 'services',
    where: { slug: { equals: 'adu' } },
    limit: 1,
    depth: 0,
  })
  if (!docs.length) throw new Error('service adu not found in CMS')
  const doc = docs[0] as unknown as {
    id: number
    sections?: Array<Record<string, unknown>>
  }

  if (mode === 'clear') {
    await payload.update({
      collection: 'services',
      id: doc.id,
      data: { overview: null as never },
    })
    console.log(`cleared overview fields on adu (id=${doc.id})`)
    process.exit(0)
  }

  // Drop the legacy image-text section that held the unstyled overview dump —
  // it also suppressed the intro (see ServiceDetailPage intro node logic).
  const sections = (doc.sections ?? []).filter((section) => {
    const heading = String(section.heading ?? '')
    return !(section.blockType === 'image-text' && /expanding your living space/i.test(heading))
  })
  console.log(
    `sections: ${(doc.sections ?? []).map((s) => s.blockType).join(', ')} -> ${sections.map((s) => s.blockType).join(', ')}`,
  )

  await payload.update({
    collection: 'services',
    id: doc.id,
    data: {
      overview: ADU_CONTENT as never,
      sections: sections as never,
    },
  })
  console.log(`seeded ADU overview rich text + cleaned legacy section (id=${doc.id})`)
  process.exit(0)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
