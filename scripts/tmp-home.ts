import { parseWordPressXmlFile } from '../wordpress-migration/xmlParser'
import { parseBricksSerialized } from '../wordpress-migration/bricksParser'
import type { BricksTreeNode } from '../wordpress-migration/types'

const source = await parseWordPressXmlFile('primedesignampbuild.WordPress.2026-08-28.xml')
const home = source.pages.find((p: any) => p.slug === 'home' || p.slug === '' || /^home/i.test(p.title))
console.log('home page:', (home as any)?.id, (home as any)?.slug, (home as any)?.title)
const flat = (n: BricksTreeNode): BricksTreeNode[] => [n, ...(n.children || []).flatMap(flat)]
if (!(home as any)?.bricksSerialized) process.exit(0)
const nodes = parseBricksSerialized((home as any).bricksSerialized).roots.flatMap(flat)
let on = false
for (const node of nodes) {
  const s = node.settings as Record<string, unknown>
  const text = String(s.text ?? s.content ?? '')
  if (/our services|services we/i.test(text)) on = true
  if (!on) continue
  const img = (s.image as any) || ((s._background as any)?.image)
  const parts: string[] = [`[${node.name}]`]
  if (text.trim()) parts.push(text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 120))
  if (img?.id) parts.push(`IMG id=${img.id} ${img.filename || ''}`)
  if (s.link || s.url) parts.push(`LINK ${JSON.stringify(s.link || s.url).slice(0, 90)}`)
  if (parts.length > 1) console.log(parts.join('  '))
}
