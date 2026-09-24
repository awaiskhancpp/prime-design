import 'dotenv/config'

/**
 * Writes the Contact page's consultation-card copy into the new fields.
 *
 *   npx tsx scripts/seed-consultation-card-copy.ts        # report only
 *   npx tsx scripts/seed-consultation-card-copy.ts write  # apply
 *
 * Both strings were literals in code: the duration badge in
 * `resolveConsultations()` and the small print in `ConsultationGrid`. The
 * values written here are exactly what those literals said, so the page looks
 * the same afterwards — this moves the words into the CMS, it does not change
 * them. Anything an editor has already typed is left alone.
 */

const DURATION = '~1 Hour'
const ASSURANCE_NOTE = 'Free · No commitment'

const write = process.argv[2] === 'write'

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

let changed = 0

// ---- per service: the duration badge ------------------------------------
const services = await payload.find({
  collection: 'services',
  where: { showInConsultationForm: { equals: true } },
  limit: 100,
  depth: 0,
})

for (const doc of services.docs as Array<Record<string, any>>) {
  if (doc.consultationDuration) {
    console.log(`${String(doc.slug).padEnd(26)} duration already set (${doc.consultationDuration})`)
    continue
  }
  console.log(`${String(doc.slug).padEnd(26)} duration -> ${JSON.stringify(DURATION)}`)
  changed += 1
  if (write) {
    await payload.update({
      collection: 'services',
      id: doc.id,
      data: { consultationDuration: DURATION } as never,
    })
  }
}

// ---- per section: the small print ---------------------------------------
const pages = await payload.find({ collection: 'pages', limit: 50, depth: 0 })

for (const page of pages.docs as Array<Record<string, any>>) {
  // The Pages collection calls its block array `layout`; the other two names
  // are here so this keeps working if a page uses a differently named one.
  const field = (['layout', 'sections', 'blocks'] as const).find((name) =>
    Array.isArray(page[name]),
  )
  if (!field) continue
  const blocks: Array<Record<string, any>> = page[field] ?? []
  let touched = false
  const next = blocks.map((block) => {
    if (block.blockType !== 'consultations' || block.assuranceNote) return block
    touched = true
    return { ...block, assuranceNote: ASSURANCE_NOTE }
  })
  if (!touched) continue

  console.log(`${String(page.slug).padEnd(26)} assurance note -> ${JSON.stringify(ASSURANCE_NOTE)}`)
  changed += 1
  if (write) {
    await payload.update({
      collection: 'pages',
      id: page.id,
      data: { [field]: next } as never,
    })
  }
}

console.log(`\n${write ? 'Applied' : 'Would apply'}: ${changed} change(s)`)
if (!write) console.log('Re-run with `write` to apply.')

process.exit(0)
