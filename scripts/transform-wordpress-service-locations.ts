import { readFile } from 'node:fs/promises'

export type WordPressLocation = {
  wordpressId: number
  title: string
  slug: string
  parentId: number
  city: string
  thumbnailId?: number
  seoDescription?: string
}

export const parentServices: Record<number, string> = {
  327: 'kitchen-remodeling',
  337: 'bathroom-remodeling',
  335: 'home-remodeling',
  1976: 'adu',
  1978: 'additions',
  1980: 'complete-renovation',
  329: 'european-kitchen',
  331: 'custom-kitchen',
  333: 'shaker-kitchen',
}

const field = (source: string, tag: string) => {
  const match = source.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))
  return (match?.[1] || '').replace(/^<!\[CDATA\[|\]\]>$/g, '').trim()
}

const meta = (source: string, key: string) => {
  const matches = [...source.matchAll(/<wp:postmeta>[\s\S]*?<wp:meta_key><!\[CDATA\[(.*?)\]\]><\/wp:meta_key>[\s\S]*?<wp:meta_value><!\[CDATA\[([\s\S]*?)\]\]><\/wp:meta_value>[\s\S]*?<\/wp:postmeta>/g)]
  return matches.find((match) => match[1] === key)?.[2]?.trim()
}

export function transformWordPressServiceLocations(xml: string): WordPressLocation[] {
  return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].flatMap((match) => {
    const item = match[1]
    if (field(item, 'wp:post_type') !== 'page' || field(item, 'wp:status') !== 'publish') return []
    const parentId = Number(field(item, 'wp:post_parent'))
    if (!parentServices[parentId] || !/ (?:in|en) /.test(field(item, 'title'))) return []
    const city = meta(item, 'city')
    if (!city) return []
    const thumbnail = meta(item, '_thumbnail_id')
    return [{
      wordpressId: Number(field(item, 'wp:post_id')),
      title: field(item, 'title'),
      slug: field(item, 'wp:post_name'),
      parentId,
      city,
      thumbnailId: thumbnail ? Number(thumbnail) : undefined,
      seoDescription: meta(item, 'rank_math_description'),
    }]
  })
}

if (process.argv[1]?.endsWith('transform-wordpress-service-locations.ts')) {
  const input = process.argv[2]
  if (!input) throw new Error('Usage: pnpm tsx scripts/transform-wordpress-service-locations.ts <wordpress-export.xml>')
  const xml = await readFile(input, 'utf8')
  const records = transformWordPressServiceLocations(xml)
  console.log(JSON.stringify({
    services: [...new Set(records.map((record) => parentServices[record.parentId]))],
    locations: [...new Set(records.map((record) => record.city))],
    serviceLocations: records,
  }, null, 2))
}
