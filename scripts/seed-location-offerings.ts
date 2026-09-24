import 'dotenv/config'

/**
 * Fills each service-location page's Offerings section from the live original.
 *
 *   npx tsx scripts/seed-location-offerings.ts        # report only
 *   npx tsx scripts/seed-location-offerings.ts write  # apply
 *
 * ── Why this exists ───────────────────────────────────────────────────────
 *
 * The section was rendered from the parent service's `sub-services` block,
 * with " Remodeling in {City}" appended to every card title. Comparing the 45
 * pages against `primedesignandbuild.com`, which is still serving the
 * WordPress original, that is wrong in three ways at once:
 *
 *   images   kitchen pages use Custom-Kitchen.png / European-Kitchen.png /
 *            Shaker-Kitchen.png; the service page uses project photographs,
 *            and those were what we rendered. Bathroom pages use three
 *            specific photos from 2023-05-05 (…56-PM-6, …57-PM-1, …57-PM-2)
 *            and we rendered the neighbouring frames of the same series
 *            (…56-PM-7, …57-PM-3, …57-PM-4) — the same room, a different shot.
 *   titles   only the kitchen pages carry the city. Bathroom cards read
 *            "Custom Bathtubs", and we printed "Custom Bathtubs Remodeling in
 *            Santa Clara".
 *   buttons  kitchen pages have one button, bathroom pages two.
 *
 * Home-remodeling pages have no offerings section at all on the original, so
 * they are left with no cards and the section does not render.
 *
 * ── Why it reads the live site ────────────────────────────────────────────
 *
 * These 45 pages are not in the WXR export in this repo — the migration used
 * an older export that no longer exists on disk — so the live HTML is the only
 * source of truth available. Fetching it here, rather than pasting the values
 * into this file, keeps the provenance checkable: re-run it and it re-derives
 * everything from the pages themselves.
 */

type Card = { title: string; description: string; href: string; image: string }

const BASE = 'https://primedesignandbuild.com'
const write = process.argv[2] === 'write'

const clean = (value: string) =>
  value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()

/** The cards, in the order the original renders them. */
function parseCards(doc: string): Card[] {
  const cards: Card[] = []
  for (const block of doc.match(/<article[^>]*fr-feature-card-alpha[\s\S]*?<\/article>/g) ?? []) {
    const title = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/)
    if (!title) continue
    const lede = block.match(/<p[^>]*fr-feature-card-alpha__lede[^>]*>([\s\S]*?)<\/p>/)
    const href = block.match(/<a[^>]*href="([^"]*)"/)
    const image =
      block.match(/data-lazy-src="([^"]+)"/) ?? block.match(/src="((?:https?:)?\/\/[^"]+uploads[^"]+)"/)
    cards.push({
      title: clean(title[1]),
      description: lede ? clean(lede[1]) : '',
      href: href?.[1] ?? '',
      image: image ? image[1].split('/').pop()! : '',
    })
  }
  return cards
}

/**
 * The heading, lede and buttons sitting above those cards.
 *
 * Anchored on the cards' own wrapper class rather than on the first card's
 * title: "Custom Bathtubs" also appears earlier in the page's schema.org
 * JSON, and anchoring on the text put the search window thousands of
 * characters too early, which is why the bathroom pages' two buttons came
 * back empty on the first run.
 */
function parseIntro(doc: string, firstCardTitle: string) {
  // The first card element itself. Not the wrapper class name — Bricks
  // inlines its stylesheet in <head>, so `.fr-feature-section-juliet__cards`
  // first appears in a CSS rule thousands of characters before the section.
  // Not the card's title either: "Custom Bathtubs" also appears in the page's
  // schema.org JSON. Both anchors put the window in the wrong place and lost
  // the buttons.
  const byElement = doc.search(/<article[^>]*fr-feature-card-alpha/)
  const byTitle = doc.indexOf(`>${firstCardTitle}<`)
  const at = byElement > 0 ? byElement : byTitle
  const head = doc.slice(Math.max(0, at - 7000), Math.max(0, at))

  const headings = [...head.matchAll(/<(?:h2|h3)[^>]*>([\s\S]*?)<\/(?:h2|h3)>/g)].map((m) => clean(m[1]))
  const paragraphs = [...head.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)]
    .map((m) => clean(m[1]))
    .filter((text) => text.length > 40)

  const buttons: Array<{ label: string; href: string }> = []
  for (const match of head.slice(-3000).matchAll(/<a[^>]*class="[^"]*brxe-button[^"]*"[^>]*>([\s\S]*?)<\/a>/g)) {
    const href = match[0].match(/href="([^"]*)"/)
    const label = clean(match[1])
    if (label) buttons.push({ label, href: href?.[1] ?? '' })
  }

  return {
    heading: headings.at(-1) ?? '',
    description: paragraphs.at(-1) ?? '',
    buttons,
  }
}

/**
 * The button targets, normalised to this site.
 *
 * The original's absolute URLs point at the WordPress domain; an in-page
 * anchor (`#contact`) is already correct and is left alone.
 */
const localHref = (href: string) => {
  if (!href) return ''
  if (href.startsWith('#') || href.startsWith('tel:') || href.startsWith('mailto:')) return href
  const path = href.replace(/^https?:\/\/[^/]+/, '')
  return path.replace(/\/$/, '') || '/'
}

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

/** Media documents are stored with the WordPress filename, sometimes with a
 *  `.webp` suffix added by the importer, so match on the stem. */
const mediaCache = new Map<string, number | null>()
async function mediaIdFor(filename: string) {
  if (!filename) return null
  if (mediaCache.has(filename)) return mediaCache.get(filename)!
  const stem = filename.replace(/\.(png|jpe?g|webp|gif)$/i, '')
  const found = await payload.find({
    collection: 'media',
    where: { filename: { like: stem } },
    limit: 1,
    depth: 0,
  })
  const id = (found.docs[0] as { id?: number } | undefined)?.id ?? null
  mediaCache.set(filename, id)
  return id
}

const { docs } = await payload.find({
  collection: 'service-locations',
  limit: 200,
  depth: 1,
  sort: 'slug',
})

let updated = 0
const missingMedia: string[] = []
const noSection: string[] = []

for (const doc of docs as Array<Record<string, any>>) {
  const serviceSlug = typeof doc.service === 'object' ? doc.service?.slug : doc.service
  const url = `${BASE}/${serviceSlug}/${doc.slug}/`
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!response.ok) {
    console.log(`  !! ${doc.slug}: HTTP ${response.status}`)
    continue
  }
  const html = await response.text()

  const cards = parseCards(html)
  if (!cards.length) {
    // Home-remodeling pages genuinely have no offerings section.
    noSection.push(doc.slug)
    console.log(`${doc.slug.padEnd(44)} no offerings section on the original — left empty`)
    continue
  }

  const intro = parseIntro(html, cards[0].title)
  const resolved = []
  for (const card of cards) {
    const image = await mediaIdFor(card.image)
    if (card.image && !image) missingMedia.push(`${doc.slug}: ${card.image}`)
    resolved.push({
      title: card.title,
      description: card.description || undefined,
      image: image ?? undefined,
      href: localHref(card.href) || undefined,
    })
  }

  const [primary, secondary] = intro.buttons
  const data = {
    offerings: {
      heading: intro.heading || undefined,
      description: intro.description || undefined,
      cards: resolved,
      primaryCta: primary ? { label: primary.label, href: localHref(primary.href) } : { label: null, href: null },
      secondaryCta: secondary
        ? { label: secondary.label, href: localHref(secondary.href) }
        : { label: null, href: null },
    },
  }

  console.log(
    `${doc.slug.padEnd(44)} ${resolved.length} cards | ${resolved.map((c) => c.image ?? '—').join(',')} | buttons: ${
      intro.buttons.map((b) => b.label).join(' + ') || 'none'
    }`,
  )

  if (write) {
    await payload.update({ collection: 'service-locations', id: doc.id, data: data as never })
    updated += 1
  }
}

console.log(`\n${write ? 'Updated' : 'Would update'}: ${updated || docs.length - noSection.length} records`)
console.log(`Pages with no offerings section (correct, matches the original): ${noSection.length}`)
if (missingMedia.length) {
  console.log(`\nImages not found in the Media collection (card left without one):`)
  for (const entry of missingMedia) console.log(`  ${entry}`)
}
if (!write) console.log('\nRe-run with `write` to apply.')

process.exit(0)
