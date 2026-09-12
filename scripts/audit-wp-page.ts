// Bricks page audit (wordpress-migration tooling) — prints sections with
// headings/body/buttons/images/videos for a given WP page id.
import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import { normalizeBricksPage } from '../wordpress-migration/normalizer'
import type { BricksTreeNode } from '../wordpress-migration/types'

const xmlPath = process.argv[2] || 'primedesignampbuild.WordPress.2026-08-28.xml'
const pageId = Number(process.argv[3] || 1670)

const source = await parseWordPressXmlFile(xmlPath)
const page = source.pages.find((p) => p.id === pageId)
if (!page) {
  console.error(`page ${pageId} not found`)
  process.exit(1)
}
console.log(`PAGE: id=${page.id} slug=${page.slug} title=${page.title}`)
const bricks = parseBricksSerialized(page.bricksSerialized || '')
console.log(`bricks elements: ${bricks.sourceElementCount}, roots: ${bricks.roots.length}`)
const sections = normalizeBricksPage(page, bricks.roots)

const textValue = (node: BricksTreeNode) => {
  const settings = node.settings as Record<string, unknown>
  return (
    [settings.text, settings.textBasic, settings.content, settings.heading, settings.title].find(
      (v): v is string => typeof v === 'string' && v.trim().length > 0,
    ) || ''
  )
}
const descendants = (node: BricksTreeNode): BricksTreeNode[] => [
  node,
  ...node.children.flatMap(descendants),
]

for (const section of sections) {
  console.log(`\n### order=${section.order} type=${section.type} sourceId=${section.sourceId}`)
  const tree = section.data.sourceTree as BricksTreeNode | undefined
  if (!tree) continue
  const nodes = descendants(tree)
  console.log(`kinds: ${[...new Set(nodes.map((n) => n.name))].join(', ')}`)
  for (const n of nodes) {
    if (!['heading', 'text-basic', 'text', 'button', 'code', 'shortcode'].includes(n.name)) continue
    const s = n.settings as Record<string, unknown>
    const link =
      typeof s.link === 'object' && s.link ? (s.link as Record<string, unknown>) : undefined
    const linkInfo = link
      ? ` link=${JSON.stringify({ url: link.url, postId: link.postId, type: link.type })}`
      : ''
    const value = n.name === 'code' ? (s.code as string) : textValue(n)
    console.log(
      `  [${n.name}${s.tag ? `/${s.tag}` : ''}] ${String(value || '').replace(/\s+/g, ' ').slice(0, 400)}${linkInfo}`,
    )
  }
  for (const n of nodes.filter((x) => x.name === 'image')) {
    const s = n.settings as Record<string, unknown>
    const img = s.image as Record<string, unknown> | undefined
    console.log(
      `  <image> ${JSON.stringify({ id: img?.id, filename: img?.filename, useDynamicData: img?.useDynamicData })}`,
    )
  }
  for (const n of nodes.filter((x) => x.name === 'video')) {
    const s = n.settings as Record<string, unknown>
    const urls = Object.values(s).filter(
      (v): v is string => typeof v === 'string' && /\.mp4|youtu/i.test(v),
    )
    console.log(`  <video> ${JSON.stringify({ fileUrl: urls[0] })}`)
  }
  for (const n of nodes.filter((x) => x.settings && typeof x.settings === 'object' && 'query' in (x.settings as object))) {
    const q = (n.settings as Record<string, unknown>).query as Record<string, unknown> | undefined
    console.log(`  <query> ${JSON.stringify({ objectType: q?.objectType, post_type: q?.post_type, posts_per_page: q?.posts_per_page })}`)
  }
}
