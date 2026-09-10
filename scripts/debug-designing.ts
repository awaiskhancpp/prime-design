// Debug: Designing with Intent — inspect rewritten <img> tags and converted upload nodes.
import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import {
  convertHTMLToLexical,
  defaultEditorConfig,
  sanitizeServerEditorConfig,
} from '@payloadcms/richtext-lexical'
import { JSDOM } from 'jsdom'
import configPromise from '../src/payload.config'

const editorConfig = await sanitizeServerEditorConfig(defaultEditorConfig, await configPromise)

const payload = await getPayload({ config: configPromise })

// Minimal replication of the migration's steps for this one post.
const htmlToText = (h: string) => new JSDOM(`<body>${h}</body>`).window.document.body.textContent?.trim() || ''
const wpRestJson = async <T,>(path: string): Promise<T | undefined> => {
  const res = await fetch(`https://r.jina.ai/https://primedesignandbuild.com/wp-json/wp/v2${path}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(90000),
  })
  const envelope = (await res.json()) as { data?: { content?: string } }
  return envelope?.data?.content ? (JSON.parse(envelope.data.content) as T) : undefined
}
type RestPost = { id: number; title: { rendered: string }; content: { rendered: string } }
const page = await wpRestJson<RestPost[]>('/posts?per_page=100&page=1&_embed=1')
const post = page?.find((p) => p.id === 3635)
if (!post) throw new Error('post 3635 not found')

// Pending media ids created by the previous migration run for the 3 imgs.
const pending = await payload.find({
  collection: 'media',
  where: { filename: { like: '_pending_designing-with-intent%' } },
  limit: 10,
})
console.log('pending media:', pending.docs.map((d) => ({ id: d.id, filename: d.filename, url: d.sourceUrl })))

const rawHtml = post.content.rendered
  .replace(/<h1>\s*<\/h1>/i, '')
  .replace(/<a[^>]*id="[^"]*"[^>]*>\s*<\/a>/gi, '')
  .replace(/<\/?figure[^>]*>/gi, '')
  .trim()

const byUrl = new Map<string, number>()
for (const d of pending.docs) if (typeof d.sourceUrl === 'string') byUrl.set(d.sourceUrl, d.id as number)

const html = rawHtml.replace(/<img[^>]*>/gi, (tag) => {
  const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1] ?? ''
  const id = byUrl.get(src)
  if (!id) return tag
  return tag.replace(/(\s\/?>)$/i, ` data-lexical-upload-relation-to="media" data-lexical-upload-id="${id}"$1`)
})

console.log('\nimg tags after rewrite:')
for (const m of html.matchAll(/<img[^>]*>/gi)) console.log(' ', m[0].slice(0, 220))

const converted = convertHTMLToLexical({ editorConfig, html, JSDOM })
const walk = (node: any): void => {
  if (!node || typeof node !== 'object') return
  if (node.type === 'upload') {
    console.log('UPLOAD NODE:', JSON.stringify(node))
  }
  if (Array.isArray(node.children)) for (const c of node.children) walk(c)
}
console.log('\nupload nodes in converted doc:')
walk((converted as any).root)

await payload.destroy()
