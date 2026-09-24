import 'dotenv/config'

/**
 * Fills the two fields added by
 * `20260924_160000_service_intro_heading_and_video_eyebrow`.
 *
 *   npx tsx scripts/seed-service-headings.ts        # report only
 *   npx tsx scripts/seed-service-headings.ts write  # apply
 *
 * ── Overview headings ─────────────────────────────────────────────────────
 *
 * `ServiceOverview` printed "{Service title} — expanding your living space"
 * on every page, because the `introHeading` it reads had no field behind it.
 * That sentence is invented, and on these two pages the live original says
 * something else. Both strings below are quoted from
 * `primedesignandbuild.com` — note the hyphen, not an em dash, and
 * "Enhancing" rather than "Expanding" on the Additions page:
 *
 *   /adu/        "Accessory Dwelling Units (ADUs) - Expanding Your Living Space"
 *   /additions/  "Home Additions - Enhancing Your Living Space"
 *
 * Only these two are seeded. Every other service page keeps the fallback
 * until someone checks what its original actually says — writing the
 * fallback into the database would make invented copy look like content.
 *
 * ── Video eyebrow ─────────────────────────────────────────────────────────
 *
 * The kitchen page's video section carries "#1 Kitchen Remodeling Company in
 * Silicon Valley" above its heading. With no eyebrow field, the import put it
 * in `description`, where it rendered as body copy under the heading instead.
 * It moves to `eyebrow` here and the description it was misfiled in is
 * cleared, so the line appears once rather than twice.
 */

const OVERVIEW_HEADINGS: Record<string, string> = {
  adu: 'Accessory Dwelling Units (ADUs) - Expanding Your Living Space',
  additions: 'Home Additions - Enhancing Your Living Space',
}

/** slug → the eyebrow its video section should carry. */
const VIDEO_EYEBROWS: Record<string, string> = {
  'kitchen-remodeling': '#1 Kitchen Remodeling Company in Silicon Valley',
}

const write = process.argv[2] === 'write'

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

let changed = 0

for (const [slug, heading] of Object.entries(OVERVIEW_HEADINGS)) {
  const found = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const doc = found.docs[0] as { id: number; introHeading?: string | null } | undefined
  if (!doc) {
    console.log(`  !! ${slug}: no such service`)
    continue
  }
  if (doc.introHeading === heading) {
    console.log(`${slug.padEnd(22)} overview heading already set`)
    continue
  }
  console.log(`${slug.padEnd(22)} overview heading -> ${JSON.stringify(heading)}`)
  changed += 1
  if (write) {
    await payload.update({
      collection: 'services',
      id: doc.id,
      data: { introHeading: heading } as never,
    })
  }
}

for (const [slug, eyebrow] of Object.entries(VIDEO_EYEBROWS)) {
  const found = await payload.find({
    collection: 'services',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const doc = found.docs[0] as { id: number; sections?: Array<Record<string, unknown>> } | undefined
  if (!doc) {
    console.log(`  !! ${slug}: no such service`)
    continue
  }

  let touched = false
  const sections = (doc.sections ?? []).map((block) => {
    if (block.blockType !== 'video') return block
    if (block.eyebrow === eyebrow) return block
    touched = true
    // Clear the description only when it is the line being moved; a video
    // section with real body copy of its own keeps it.
    const description = block.description === eyebrow ? null : block.description
    return { ...block, eyebrow, description }
  })

  if (!touched) {
    console.log(`${slug.padEnd(22)} video eyebrow already set`)
    continue
  }
  console.log(`${slug.padEnd(22)} video eyebrow    -> ${JSON.stringify(eyebrow)}`)
  changed += 1
  if (write) {
    await payload.update({ collection: 'services', id: doc.id, data: { sections } as never })
  }
}

console.log(`\n${write ? 'Applied' : 'Would apply'}: ${changed} change(s)`)
if (!write) console.log('Re-run with `write` to apply.')

process.exit(0)
