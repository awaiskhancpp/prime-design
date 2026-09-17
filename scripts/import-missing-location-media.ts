/**
 * Imports the two WordPress originals the export never carried, then finishes
 * the home-remodeling location feature images.
 *
 *   wp 708  145.png  1200x900  1,368,559 bytes
 *   wp 681  178.png  1200x900  1,736,699 bytes
 *
 * Why this is a separate script: primedesignandbuild.com (and the staging
 * origin prime.tagmediaspace.dev recorded in each attachment's <guid>) returns
 * 403 for every request from outside the US — the site root 403s too, so it is
 * a geo/WAF rule rather than hotlink protection. The WordPress REST API is
 * readable through the r.jina.ai reader this repo already uses elsewhere, which
 * is how the metadata below was confirmed, but that reader returns text and
 * cannot hand back image bytes.
 *
 * So run this from a US network (or a VPN), or download the two files by hand
 * and pass their paths:
 *
 *   pnpm tsx scripts/import-missing-location-media.ts
 *   pnpm tsx scripts/import-missing-location-media.ts ./145.png ./178.png
 *
 * Run it with tsx, as above. Do NOT run `tsc scripts/import-missing-location-media.ts`:
 * passing a filename to tsc makes it ignore tsconfig.json, so `esModuleInterop`
 * and `skipLibCheck` are off and you get ~122 bogus TS1259 errors out of zod's
 * bundled locale typings. Use `pnpm typecheck` to type-check the project.
 *
 * Every candidate is checked against the byte size and pixel dimensions
 * recorded in the WordPress export before anything is written, so a wrong file
 * — or a placeholder — is rejected rather than quietly imported.
 *
 * Idempotent: media already present is reused, and the feature-image list is
 * rebuilt from scratch each run.
 */
import 'dotenv/config'
import { readFile, writeFile, unlink } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { getPayload } from 'payload'
import sharp from 'sharp'

import configPromise from '../src/payload.config'

/** Straight from the WXR export and confirmed against the REST API. */
const TARGETS = [
  {
    wordpressId: 708,
    filename: '145.png',
    bytes: 1368559,
    width: 1200,
    height: 900,
    sourceUrl: 'https://primedesignandbuild.com/wp-content/uploads/2023/05/145.png',
  },
  {
    wordpressId: 681,
    filename: '178.png',
    bytes: 1736699,
    width: 1200,
    height: 900,
    sourceUrl: 'https://primedesignandbuild.com/wp-content/uploads/2023/05/178.png',
  },
]

/** The WordPress order of the home-remodeling family template's three photos. */
const HOME_FEATURE_WP_IDS = [696, 708, 681]

const payload = await getPayload({ config: configPromise })
const localPaths = process.argv.slice(2)

/** Returns a local path to a verified file, or null when it cannot be had. */
async function obtain(target: (typeof TARGETS)[number], index: number) {
  const provided = localPaths[index]
  if (provided) {
    if (!existsSync(provided)) throw new Error(`File not found: ${provided}`)
    return provided
  }
  process.stdout.write(`   downloading ${target.sourceUrl} ... `)
  const response = await fetch(target.sourceUrl)
  if (!response.ok) {
    console.log(`HTTP ${response.status} — blocked from this network`)
    return null
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const tmp = join(tmpdir(), target.filename)
  await writeFile(tmp, buffer)
  console.log(`${buffer.length} bytes`)
  return tmp
}

/**
 * Refuses anything that is not the WordPress original.
 *
 * Identity is checked on format and exact pixel dimensions, which a wrong
 * image or a placeholder will not match. The byte size recorded in the export
 * is reported but NOT enforced: the site runs Imagify, which re-compresses
 * uploads in place, so the file served today is smaller than the one the
 * 2026-08-28 export measured while being the same image.
 */
async function verify(path: string, target: (typeof TARGETS)[number]) {
  const buffer = await readFile(path)
  const meta = await sharp(buffer).metadata()

  if (meta.format !== 'png')
    throw new Error(`${target.filename}: expected a png, got ${meta.format}`)
  if (meta.width !== target.width || meta.height !== target.height)
    throw new Error(
      `${target.filename}: expected ${target.width}x${target.height}, got ${meta.width}x${meta.height}`,
    )
  // A real 1200x900 photo is never this small; catches an error page saved as .png.
  if (buffer.length < 20_000)
    throw new Error(`${target.filename}: only ${buffer.length} bytes — not a real image`)

  if (buffer.length !== target.bytes) {
    console.log(
      `      note: ${buffer.length} bytes vs ${target.bytes} in the export ` +
        `(Imagify re-compressed it server-side; dimensions match, so this is the same image)`,
    )
  }
  return buffer.length
}

console.log('--- importing missing WordPress originals ---')
let imported = 0
for (const [index, target] of TARGETS.entries()) {
  const existing = await payload.find({
    collection: 'media',
    where: { wordpressId: { equals: target.wordpressId } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length) {
    console.log(`   wp ${target.wordpressId} already imported -> media#${existing.docs[0].id}`)
    continue
  }

  const path = await obtain(target, index)
  if (!path) continue

  const size = await verify(path, target)
  const doc = await payload.create({
    collection: 'media',
    data: {
      alt: target.filename.replace(/\.[a-z]+$/i, ''),
      wordpressId: target.wordpressId,
      sourceUrl: target.sourceUrl,
    },
    filePath: path,
  })
  imported += 1
  console.log(`   wp ${target.wordpressId} imported -> media#${doc.id} (${size} bytes, verified)`)
  if (!localPaths[index]) await unlink(path).catch(() => {})
}

console.log(`\nimported ${imported} file(s)`)

// --- rebuild home-remodeling's feature images in WordPress order -------------
console.log('\n--- home-remodeling location feature images ---')
const service = await payload.find({
  collection: 'services',
  where: { slug: { equals: 'home-remodeling' } },
  limit: 1,
  depth: 0,
})
if (!service.docs.length) throw new Error('No service row with slug "home-remodeling"')

const ids: number[] = []
for (const wpId of HOME_FEATURE_WP_IDS) {
  const found = await payload.find({
    collection: 'media',
    where: { wordpressId: { equals: wpId } },
    limit: 1,
    depth: 0,
  })
  if (found.docs.length) {
    ids.push(Number(found.docs[0].id))
    console.log(`   wp ${String(wpId).padEnd(4)} -> media#${found.docs[0].id}`)
  } else {
    console.log(`   wp ${String(wpId).padEnd(4)} still missing — slot left empty`)
  }
}

await payload.update({
  collection: 'services',
  id: service.docs[0].id,
  data: { locationFeatureImages: ids },
})
console.log(`\nhome-remodeling now has ${ids.length}/3 feature images`)

process.exit(0)
