import 'dotenv/config'

/**
 * Fills the service-location pages' Prime Difference card copy and the
 * Offerings section's two buttons.
 *
 *   npx tsx scripts/seed-location-prime-difference.ts        # report only
 *   npx tsx scripts/seed-location-prime-difference.ts write  # apply
 *
 * ── The card copy ─────────────────────────────────────────────────────────
 *
 * The 45 location pages render four reason cards — Customer Satisfaction,
 * Expertise, Attention to Detail, Quality Craftsmanship — and every one of
 * the 180 rows had a title, an icon and `description = null`. That was
 * faithful to WordPress: on the live original each card is literally
 * `<h3>Expertise</h3><img …>` and carries no body text at all, which is why
 * they read as one stray word on the page.
 *
 * The sentences below are not invented for this task. They are the company's
 * own copy for these same four cards, published today on its Google Ads
 * landing pages (verified against
 * https://primedesignandbuild.com/remodeling-information/, where the cards
 * read "Attention to Detail — We meticulously plan and execute every project
 * with precision and attention to detail." and so on). Filling the location
 * pages from there keeps every word something the business already says
 * about itself.
 *
 * The card titles are left exactly as WordPress has them, so "Expertise"
 * stays "Expertise" here even though the landing pages title the same card
 * "Professional Expertise" — the title is content that page already had, and
 * only the missing half is being supplied.
 *
 * ── The buttons ───────────────────────────────────────────────────────────
 *
 * `ServiceLocationPage` hardcoded one "Talk to an expert" button. The live
 * original has two, in this order: "View our gallery" (→ /gallery) and "Talk
 * to an expert" (→ #contact, the form on the same page). Both are now fields
 * on the record, so the labels are editable rather than compiled in.
 */

type LexicalText = {
  root: {
    type: 'root'
    format: ''
    indent: 0
    version: 1
    direction: 'ltr'
    children: Array<Record<string, unknown>>
  }
}

/** The one-paragraph Lexical document Payload stores for a plain sentence. */
const richText = (text: string): LexicalText => ({
  root: {
    type: 'root',
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    children: [
      {
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children: [
          { mode: 'normal', text, type: 'text', style: '', detail: 0, format: 0, version: 1 },
        ],
      },
    ],
  },
})

/** Card title (as WordPress has it) → the company's own sentence for it. */
const CARD_COPY: Record<string, string> = {
  'customer satisfaction': 'We prioritize your satisfaction with exceptional service and communication.',
  expertise: 'With years of industry experience, we create exceptional, tailored home remodels.',
  'professional expertise':
    'With years of industry experience, we create exceptional, tailored home remodels.',
  'attention to detail':
    'We meticulously plan and execute every project with precision and attention to detail.',
  'quality craftsmanship':
    'Our commitment to quality ensures outstanding and beautiful home transformations.',
}

const OFFERINGS_CTAS = {
  primaryCta: { label: 'View our gallery', href: '/gallery' },
  secondaryCta: { label: 'Talk to an expert', href: '#contact' },
}

const write = process.argv[2] === 'write'

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const { docs } = await payload.find({ collection: 'service-locations', limit: 200, depth: 0 })

let filledCards = 0
let skippedCards = 0
const unknownTitles: string[] = []
let touchedDocs = 0

for (const doc of docs as Array<Record<string, any>>) {
  const reasons: Array<Record<string, any>> = doc.primeDifference?.reasons ?? []
  let changed = false

  const nextReasons = reasons.map((reason) => {
    const key = String(reason.title ?? '').trim().toLowerCase()
    const sentence = CARD_COPY[key]
    if (!sentence) {
      if (!unknownTitles.includes(reason.title)) unknownTitles.push(reason.title)
      return reason
    }
    // Never overwrite copy someone has already written in the admin.
    if (reason.description) {
      skippedCards += 1
      return reason
    }
    filledCards += 1
    changed = true
    return { ...reason, description: richText(sentence) }
  })

  const offerings = doc.offerings ?? {}
  const needsCtas = !offerings.primaryCta?.label && !offerings.secondaryCta?.label
  if (needsCtas) changed = true

  if (!changed) continue
  touchedDocs += 1

  if (write) {
    await payload.update({
      collection: 'service-locations',
      id: doc.id,
      data: {
        primeDifference: { ...doc.primeDifference, reasons: nextReasons },
        ...(needsCtas ? { offerings: OFFERINGS_CTAS } : {}),
      },
    })
  }
}

console.log(`${write ? 'Wrote' : 'Would write'}: ${touchedDocs} of ${docs.length} location records`)
console.log(`  card descriptions filled: ${filledCards}`)
console.log(`  cards left alone (already written): ${skippedCards}`)
if (unknownTitles.length) {
  console.log(`  titles with no matching sentence, left empty: ${unknownTitles.join(', ')}`)
}
if (!write) console.log('\nRe-run with `write` to apply.')

process.exit(0)
