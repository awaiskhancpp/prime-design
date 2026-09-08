import { readFile } from 'node:fs/promises'
import { transformWordPressServiceLocations } from '../scripts/transform-wordpress-service-locations'

async function inspect() {
  const xmlPath = 'C:/Users/HP/Downloads/primedesignampbuild.WordPress.2026-08-28.xml'
  const xml = await readFile(xmlPath, 'utf8')
  const records = transformWordPressServiceLocations(xml)
  console.log(`Found ${records.length} location records from transformWordPressServiceLocations`)

  // Check unique parent IDs in XML for pages with ' in ' or ' en '
  const matches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  const locationLikeItems: Array<{ id: number; title: string; parentId: number; slug: string }> = []
  for (const m of matches) {
    const item = m[1]
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/)
    const title = titleMatch ? titleMatch[1].replace(/^<!\[CDATA\[|\]\]>$/g, '') : ''
    const postType = item.match(/<wp:post_type>([\s\S]*?)<\/wp:post_type>/)?.[1]
    const parent = Number(item.match(/<wp:post_parent>([\s\S]*?)<\/wp:post_parent>/)?.[1] || 0)
    const id = Number(item.match(/<wp:post_id>([\s\S]*?)<\/wp:post_id>/)?.[1] || 0)
    const slug = item.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/)?.[1] || ''

    if (postType === 'page' && / (?:in|en) /i.test(title)) {
      locationLikeItems.push({ id, title, parentId: parent, slug })
    }
  }

  console.log(`Found ${locationLikeItems.length} pages with ' in ' / ' en ' in title`)
  const parentIds = [...new Set(locationLikeItems.map((l) => l.parentId))]
  console.log('Parent IDs of these pages:', parentIds)

  // Map parent IDs to titles
  for (const pid of parentIds) {
    for (const m of matches) {
      const item = m[1]
      const id = Number(item.match(/<wp:post_id>([\s\S]*?)<\/wp:post_id>/)?.[1] || 0)
      if (id === pid) {
        const title = item.match(/<title>([\s\S]*?)<\/title>/)?.[1].replace(/^<!\[CDATA\[|\]\]>$/g, '')
        const slug = item.match(/<wp:post_name>([\s\S]*?)<\/wp:post_name>/)?.[1]
        console.log(`  Parent ${pid}: "${title}" (slug: ${slug})`)
      }
    }
  }
}

inspect().catch(console.error)
