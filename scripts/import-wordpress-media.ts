/**
 * Imports WordPress attachments the original migration skipped.
 *
 * Reusable: pass WordPress attachment ids and it reads each one's real URL and
 * expected dimensions straight out of the WXR export, downloads it, checks it
 * is that image, and creates the Media record with its `wordpressId` and
 * `sourceUrl` provenance intact.
 *
 *   pnpm tsx scripts/import-wordpress-media.ts 579 1123 1124 1125 1130 1194
 *   pnpm tsx scripts/import-wordpress-media.ts            # the default set below
 *
 * Run it with tsx. Do NOT run `tsc scripts/import-wordpress-media.ts`: passing a
 * filename makes tsc ignore tsconfig.json, so `noEmit` is off and it litters
 * src/ with compiled .js files (and floods you with zod TS1259 errors).
 *
 * Identity is checked on exact pixel dimensions from the export, not byte size
 * — the site runs Imagify, which re-compresses uploads in place, so the served
 * file is smaller than the export recorded while being the same image.
 *
 * The origin geo-blocks non-US traffic; from a blocked network every download
 * reports 403 and nothing is written. Idempotent.
 */
import 'dotenv/config'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPayload } from 'payload'
import sharp from 'sharp'

import configPromise from '../src/payload.config'

const XML = 'primedesignampbuild.WordPress.2026-08-28.xml'

/** Attachments the location-page sections need. */
const DEFAULT_IDS = [579, 1123, 1124, 1125, 1130, 1194]

type Attachment = { wp: number; url: string; file: string; width: number; height: number }

/** Reads an attachment's URL and dimensions out of the WordPress export. */
async function fromExport(ids: number[]): Promise<Attachment[]> {
  const raw = await readFile(XML, 'utf8')
  const want = new Set(ids.map(String))
  const found: Attachment[] = []
  for (const item of raw.split('<item>')) {
    const id = /<wp:post_id>(\d+)<\/wp:post_id>/.exec(item)
    if (!id || !want.has(id[1])) continue
    if (!item.includes('<wp:post_type><![CDATA[attachment]]>')) continue
    const url = /<wp:attachment_url><!\[CDATA\[(.*?)\]\]>/.exec(item)
    const meta = /"width";i:(\d+);s:6:"height";i:(\d+)/.exec(item)
    if (!url || !meta) continue
    found.push({
      wp: Number(id[1]),
      url: url[1],
      file: url[1].split('/').pop()!,
      width: Number(meta[1]),
      height: Number(meta[2]),
    })
  }
  const missing = ids.filter((id) => !found.some((f) => f.wp === id))
  if (missing.length) throw new Error(`Not found in the export: ${missing.join(', ')}`)
  return found.sort((a, b) => ids.indexOf(a.wp) - ids.indexOf(b.wp))
}

const ids = process.argv.slice(2).map(Number).filter(Boolean)
const attachments = await fromExport(ids.length ? ids : DEFAULT_IDS)
const payload = await getPayload({ config: configPromise })

let imported = 0
let skipped = 0
let blocked = 0

for (const a of attachments) {
  const existing = await payload.find({
    collection: 'media',
    where: { wordpressId: { equals: a.wp } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length) {
    skipped += 1
    console.log(`  wp ${String(a.wp).padEnd(5)} already imported -> media#${existing.docs[0].id}`)
    continue
  }

  const response = await fetch(a.url)
  if (!response.ok) {
    blocked += 1
    console.log(`  wp ${String(a.wp).padEnd(5)} HTTP ${response.status} — ${a.file} (origin blocked)`)
    continue
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const probe = await sharp(buffer).metadata()
  if (probe.width !== a.width || probe.height !== a.height) {
    throw new Error(
      `${a.file}: expected ${a.width}x${a.height}, got ${probe.width}x${probe.height} — not the WordPress original`,
    )
  }

  const tmp = join(tmpdir(), a.file)
  await writeFile(tmp, buffer)
  const doc = await payload.create({
    collection: 'media',
    data: {
      alt: a.file.replace(/\.[a-z]+$/i, '').replace(/[-_]+/g, ' '),
      wordpressId: a.wp,
      sourceUrl: a.url,
    },
    filePath: tmp,
  })
  await unlink(tmp).catch(() => {})
  imported += 1
  console.log(
    `  wp ${String(a.wp).padEnd(5)} imported -> media#${doc.id} ${a.file} (${probe.width}x${probe.height}, ${buffer.length} bytes)`,
  )
}

console.log(`\nimported ${imported}, already present ${skipped}, blocked ${blocked}`)
if (blocked) {
  console.log('Blocked downloads need a US network or VPN — the origin geo-blocks other regions.')
}
process.exit(0)
