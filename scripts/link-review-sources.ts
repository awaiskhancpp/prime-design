import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Give every truncated Yelp review a link to itself on Yelp, and flag it as an
 * excerpt.
 *
 * WHY THIS EXISTS. Yelp's Fusion API returns a ~160-character *excerpt* of a
 * review, cut mid-sentence and closed with "...", and never the full text. The
 * WordPress site's review plugin (Business Reviews Bundle) reads that API, so
 * the live site shows exactly the same truncated reviews — 141 of the 378
 * review texts on primedesignandbuild.com/testimonials/ end in "...". Nothing
 * was lost in the migration and nothing here can recover the rest: the full
 * text exists only on yelp.com, which refuses automated requests (403 to a
 * plain fetch and to a real headless browser alike). Google's API returns full
 * reviews, which is why all 76 Google records here are complete and none of
 * them needs this.
 *
 * So the ellipsis gets an escape hatch. Each truncated review is matched to
 * its Yelp permalink — the plugin renders one per review, carrying the
 * review's own `hrid` — and the card offers "Read the full review on Yelp"
 * instead of trailing off.
 *
 * TO REPLACE AN EXCERPT WITH THE REAL THING: open the review on Yelp (the
 * links this writes, or `--list`), copy the text, paste it into the
 * testimonial's `quote` in the admin and untick "Quote is a truncated
 * excerpt". The card then shows the whole review like any Google one.
 *
 *   npx tsx scripts/link-review-sources.ts [--dry] [--list] [--file <path>]
 *
 * `--list` prints every excerpt with its Yelp link and writes nothing, which
 * is the worksheet for doing the paste-in by hand.
 */

const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const listOnly = args.includes('--list')
const fileArg = args.indexOf('--file')
const localFile = fileArg >= 0 ? args[fileArg + 1] : undefined

/** The live page is the source; the plugin renders the permalinks into it. */
const SOURCE_URL = 'https://primedesignandbuild.com/testimonials/'

const decode = (value: string) =>
  value
    .replace(/&#0*38;|&amp;/g, '&')
    .replace(/&#0*39;|&apos;|&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const strip = (value: string) => decode(value.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()

const html = localFile
  ? readFileSync(localFile, 'utf8')
  : await (await fetch(SOURCE_URL, { headers: { 'User-Agent': 'Mozilla/5.0' } })).text()

/** One `rplg-box` per review: the reviewer's name, a permalink, and the text. */
const boxes = html.split('<div class="rplg-box">').slice(1)

type SourceReview = { name: string; text: string; url?: string; truncated: boolean }

const scraped: SourceReview[] = []
for (const box of boxes) {
  const text = /<span class="rplg-review-text">([\s\S]*?)<\/span>/.exec(box)
  if (!text) continue
  const name = /class="rplg-review-name rplg-trim"[^>]*title="([^"]*)"/.exec(box)
  const href = /href="(https:\/\/www\.yelp\.com\/biz\/[^"]*hrid=[^"]*)"/.exec(box)
  const body = strip(text[1])
  scraped.push({
    name: name ? decode(name[1]).trim() : '',
    text: body,
    url: href ? decode(href[1]) : undefined,
    truncated: body.endsWith('...') || body.endsWith('…'),
  })
}

console.log(
  `source: ${scraped.length} reviews, ${scraped.filter((r) => r.truncated).length} truncated, ` +
    `${scraped.filter((r) => r.url).length} with a Yelp permalink`,
)

const payload = await getPayload({ config: configPromise })
const { docs } = await payload.find({ collection: 'testimonials', depth: 0, limit: 500 })
const testimonials = docs as unknown as Array<{
  id: number
  name: string
  quote: string
  source?: string | null
  sourceUrl?: string | null
}>

/**
 * Matched on the excerpt itself rather than the name: several reviewers share
 * a first name and last initial, and the excerpt is effectively unique. The
 * first 60 characters are compared so that a stray entity or a double space
 * does not stop a match.
 */
const key = (value: string) => value.replace(/\s+/g, ' ').trim().slice(0, 60).toLowerCase()
const byKey = new Map(scraped.filter((r) => r.url).map((r) => [key(r.text), r]))

const gaps: string[] = []
let linked = 0
const worksheet: string[] = []

for (const record of testimonials) {
  const isExcerpt = record.quote.trim().endsWith('...') || record.quote.trim().endsWith('…')
  if (!isExcerpt) continue

  const match = byKey.get(key(record.quote))
  if (!match?.url) {
    gaps.push(`${record.name}: no Yelp permalink found for "${record.quote.slice(0, 50)}…"`)
    continue
  }

  worksheet.push(`${record.id}\t${record.name}\t${match.url}`)
  linked += 1

  if (listOnly || dryRun) continue
  await payload.update({
    collection: 'testimonials',
    id: record.id,
    data: { sourceUrl: match.url, quoteIsExcerpt: true } as never,
  })
}

if (listOnly) {
  console.log('\nid\tname\tlink to the full review')
  for (const row of worksheet) console.log(row)
} else {
  console.log(`\n${dryRun ? 'would link' : 'linked'} ${linked} truncated reviews`)
}

if (gaps.length) {
  console.log('\nGAPS:')
  for (const gap of gaps) console.log(`  - ${gap}`)
}

process.exit(0)
