import 'dotenv/config'

/**
 * Fills each project's description from the live original.
 *
 *   npx tsx scripts/seed-project-descriptions.ts        # report only
 *   npx tsx scripts/seed-project-descriptions.ts write  # apply
 *
 * ── What the original has ─────────────────────────────────────────────────
 *
 * Every project page on `primedesignandbuild.com` is at `/project/{slug}/`,
 * and the write-up sits in `div.brxe-post-content` as one or more paragraphs
 * — with inline links in some of them ("an outdated <a>kitchen</a> that was
 * in bad shape"), which is why this is stored as rich text rather than a
 * string. Projects whose page has no write-up are left exactly as they are:
 * their card keeps the excerpt it shows today.
 *
 * ── Why it reads the live site ────────────────────────────────────────────
 *
 * Same reason as the service-location seeders: the WXR export in this repo is
 * incomplete, and the live WordPress site is the only source of truth for
 * this content. Re-running re-derives everything from the pages themselves.
 */

type LexicalNode = Record<string, unknown>

const write = process.argv[2] === 'write'
const BASE = 'https://primedesignandbuild.com'

const decode = (value: string) =>
  value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;|&#x27;/g, "'")
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/&#8216;|&lsquo;/g, '‘')
    .replace(/&#8220;|&ldquo;/g, '“')
    .replace(/&#8221;|&rdquo;/g, '”')
    .replace(/&#8211;|&ndash;/g, '–')
    .replace(/&#8212;|&mdash;/g, '—')

const textNode = (text: string): LexicalNode => ({
  mode: 'normal',
  text,
  type: 'text',
  style: '',
  detail: 0,
  format: 0,
  version: 1,
})

/**
 * An inline link, in the shape Payload's Lexical link feature stores.
 *
 * Absolute URLs on the WordPress domain are rewritten to paths so they stay
 * on this site — "an outdated kitchen" points at /kitchen-remodeling/, which
 * exists here too.
 */
const linkNode = (href: string, text: string): LexicalNode => {
  const url = href.startsWith(BASE) ? href.slice(BASE.length) || '/' : href
  const internal = url.startsWith('/')
  return {
    type: 'link',
    version: 3,
    format: '',
    indent: 0,
    direction: 'ltr',
    fields: { url, newTab: !internal, linkType: 'custom' },
    children: [textNode(text)],
  }
}

/** One `<p>`'s inner HTML → the inline children of a Lexical paragraph. */
function inlineChildren(inner: string): LexicalNode[] {
  const children: LexicalNode[] = []
  let cursor = 0
  const anchor = /<a\b[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null

  const pushText = (raw: string) => {
    const text = decode(raw.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ')
    if (text) children.push(textNode(text))
  }

  while ((match = anchor.exec(inner))) {
    pushText(inner.slice(cursor, match.index))
    const label = decode(match[2].replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ')
    if (label) children.push(linkNode(match[1], label))
    cursor = match.index + match[0].length
  }
  pushText(inner.slice(cursor))

  return children
}

function lexicalFromHtml(html: string) {
  const paragraphs = [...html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => inlineChildren(match[1]))
    .filter((children) => children.length > 0)

  if (!paragraphs.length) return null

  return {
    root: {
      type: 'root',
      format: '',
      indent: 0,
      version: 1,
      direction: 'ltr',
      children: paragraphs.map((children) => ({
        type: 'paragraph',
        format: '',
        indent: 0,
        version: 1,
        direction: 'ltr',
        children,
      })),
    },
  }
}

/** The plain-text reading of a Lexical value, for the card and for meta. */
function plainText(value: ReturnType<typeof lexicalFromHtml>): string {
  if (!value) return ''
  const parts: string[] = []
  const walk = (node: LexicalNode) => {
    if (typeof node.text === 'string') parts.push(node.text)
    const children = node.children as LexicalNode[] | undefined
    children?.forEach(walk)
  }
  ;(value.root.children as LexicalNode[]).forEach((block) => {
    const before = parts.length
    walk(block)
    if (parts.length > before) parts.push('\n\n')
  })
  return parts.join('').trim()
}

const { getPayload } = await import('payload')
const { default: config } = await import('../src/payload.config')
const payload = await getPayload({ config })

const { docs } = await payload.find({ collection: 'projects', limit: 200, depth: 0, sort: 'title' })

let withText = 0
let without = 0
let updated = 0

for (const doc of docs as Array<Record<string, any>>) {
  const url = `${BASE}/project/${doc.slug}/`
  const response = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
  if (!response.ok) {
    console.log(`${String(doc.slug).slice(0, 44).padEnd(46)} HTTP ${response.status} — left as is`)
    without += 1
    continue
  }
  const html = await response.text()

  // The Bricks post-content block is the project's own write-up. Anything
  // outside it — the review widgets, the CTA bands — is page furniture.
  const block = html.match(/<div class="brxe-post-content">([\s\S]*?)<\/div>/i)
  const rich = block ? lexicalFromHtml(block[1]) : null

  if (!rich) {
    without += 1
    console.log(`${String(doc.slug).slice(0, 44).padEnd(46)} no write-up on the original — keeping current text`)
    continue
  }

  withText += 1
  const text = plainText(rich)
  const paragraphs = (rich.root.children as unknown[]).length
  const links = JSON.stringify(rich).split('"type":"link"').length - 1
  const had = typeof doc.description === 'string' ? doc.description.length : 0
  console.log(
    `${String(doc.slug).slice(0, 44).padEnd(46)} ${paragraphs}p ${String(text.length).padStart(4)} chars` +
      `${links ? `, ${links} link(s)` : ''}  (stored today: ${had} chars)`,
  )

  if (write) {
    await payload.update({
      collection: 'projects',
      id: doc.id,
      // `content` is the rich text the project page renders; `description`
      // keeps its plain reading so the cards and meta tags have a string
      // without having to flatten the editor state at render time.
      data: { content: rich, description: text } as never,
    })
    updated += 1
  }
}

console.log(`\nprojects with a write-up on the original: ${withText}`)
console.log(`projects without one (left untouched):    ${without}`)
if (write) console.log(`updated: ${updated}`)
else console.log('\nRe-run with `write` to apply.')

process.exit(0)
