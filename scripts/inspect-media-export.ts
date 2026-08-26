import { readFile } from 'node:fs/promises'

const input = process.argv[2] || 'C:/Users/HP/Downloads/primedesignandbuild.WordPress.2026-08-26 (1).xml'
const xml = await readFile(input, 'utf8')
const records = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((match) => match[1]).filter((item) => item.includes('<wp:post_type><![CDATA[attachment]]></wp:post_type>'))
const field = (item: string, tag: string) => item.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`))?.[1].replace(/^<!\[CDATA\[|\]\]>$/g, '').trim()
console.log(JSON.stringify({
  attachments: records.length,
  withUrls: records.filter((item) => field(item, 'wp:attachment_url')).length,
  sample: records.slice(0, 5).map((item) => ({ id: field(item, 'wp:post_id'), title: field(item, 'title'), url: field(item, 'wp:attachment_url') })),
}, null, 2))
