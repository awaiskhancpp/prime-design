// Bricks template audit — same tooling as audit-wp-page.ts, but for
// `bricks_template` items (header/footer/section templates), which the
// migration XML parser intentionally skips.
//
//   pnpm exec tsx scripts/audit-wp-template.ts <templateId> [xmlPath]
import fs from 'node:fs/promises'

import { parseWordPressXml } from '../wordpress-migration/xmlParser'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import type { WordPressPage } from '../wordpress-migration/types'
import type { BricksTreeNode } from '../wordpress-migration/types'

const templateId = Number(process.argv[2] || 78)
const xmlPath = process.argv[3] || 'primedesignampbuild.WordPress.2026-08-28.xml'
const xml = await fs.readFile(xmlPath, 'utf8')

// The migration parser only keeps `page` items, so pull the template's own
// item fields out of the raw export by hand.
const item = xml
  .split('<item>')
  .slice(1)
  .find((chunk) => chunk.includes(`<wp:post_id>${templateId}</wp:post_id>`))
if (!item) {
  console.error(`template ${templateId} not found`)
  process.exit(1)
}

const cdata = (tag: string) =>
  item.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`))?.[1] || ''

const metaPairs = [...item.matchAll(/<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>\s*<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>/g)]
const meta: Record<string, string> = {}
for (const [, key, value] of metaPairs) meta[key] = value
// The export puts some values before their key — pick those up too.
const metaPairsReversed = [...item.matchAll(/<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>\s*<wp:meta_key><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_key>/g)]
for (const [, value, key] of metaPairsReversed) meta[key] = value

const page = {
  id: templateId,
  slug: cdata('wp:post_name'),
  title: cdata('title'),
  meta,
  // Header/footer templates store their Bricks data under their own meta key.
  bricksSerialized:
    meta['_bricks_page_content_2'] ||
    meta['_bricks_page_footer_2'] ||
    meta['_bricks_page_header_2'] ||
    '',
} as unknown as WordPressPage

console.log(`TEMPLATE: id=${page.id} slug=${page.slug} title=${page.title}`)
const bricks = parseBricksSerialized(page.bricksSerialized || '')
console.log(`bricks elements: ${bricks.sourceElementCount}, roots: ${bricks.roots.length}`)
const sections = normalizeBricksPage(page, bricks.roots)

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v : '')
const descendants = (node: BricksTreeNode): BricksTreeNode[] => [node, ...node.children.flatMap(descendants)]

const describeBackground = (settings: Record<string, unknown>) => {
  const bg = settings._background as Record<string, unknown> | undefined
  if (!bg) return ''
  const image = bg.image as Record<string, unknown> | undefined
  const color = bg.color as Record<string, unknown> | undefined
  const parts: string[] = []
  if (image) parts.push(`image=${JSON.stringify({ id: image.id, filename: image.filename, url: image.url })}`)
  if (color) parts.push(`color=${JSON.stringify({ raw: color.raw, hex: color.hex })}`)
  for (const key of ['size', 'position', 'repeat', 'attachment']) {
    if (bg[key]) parts.push(`${key}=${JSON.stringify(bg[key])}`)
  }
  return parts.length ? ` bg{${parts.join(' ')}}` : ''
}

for (const section of sections) {
  console.log(`\n### order=${section.order} type=${section.type} sourceId=${section.sourceId}`)
  const tree = section.data.sourceTree as BricksTreeNode | undefined
  if (!tree) continue
  for (const n of descendants(tree)) {
    const s = (n.settings || {}) as Record<string, unknown>
    const label = str(s.label)
    const text = str(s.text) || str(s.textBasic) || str(s.content) || str(s.title)
    const link = s.link as Record<string, unknown> | undefined
    const linkInfo = link ? ` link=${JSON.stringify({ type: link.type, url: typeof link.url === 'object' ? link.url : link.url, postId: link.postId })}` : ''
    const img = s.image as Record<string, unknown> | undefined
    const imgInfo = img?.id ? ` image=${JSON.stringify({ id: img.id, filename: img.filename })}` : ''
    const tag = str(s.tag)
    const line = [
      `${n.name}${tag ? `/${tag}` : ''}`.padEnd(16),
      label ? `label="${label}"` : '',
      text ? `text="${text.replace(/\s+/g, ' ').slice(0, 140)}"` : '',
      imgInfo,
      linkInfo,
      describeBackground(s),
    ]
      .filter(Boolean)
      .join(' ')
    console.log(`  ${line}`)
  }
}
