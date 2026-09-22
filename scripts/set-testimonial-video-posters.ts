/**
 * Repoints the Testimonials page video posters at the same poster set the
 * homepage "Prime Difference" carousel uses.
 *
 *   npx tsx scripts/set-testimonial-video-posters.ts        # report only
 *   npx tsx scripts/set-testimonial-video-posters.ts write  # apply
 *
 * Five of the six testimonial clips are the same files the homepage plays, so
 * they take the homepage's poster frame and the two sections stop showing the
 * same video behind two different stills. The mapping is by video filename,
 * read from the homepage `difference` block rather than hardcoded, so it
 * follows any poster changed there.
 *
 * `prime-kitchens-san-luis.mp4` is the one clip the homepage does not play. Its
 * poster is a frame pulled from the video itself at 00:52 — the finished
 * kitchen, after the opening title card and clear of the hand-held speaking
 * shots, which are motion-blurred. Uploaded by this script on first run.
 *
 * The `*-poster.jpg` stills previously referenced here are left in the Media
 * collection, unused.
 */
import path from 'path'
import dotenv from 'dotenv'
dotenv.config()

const { getPayload } = await import('payload')
const configPromise = (await import('@payload-config')).default
const payload = await getPayload({ config: configPromise })

const write = process.argv[2] === 'write'
const FRAME_FILE = path.resolve(process.env.SAN_LUIS_FRAME || '')
const FRAME_NAME = 'video-poster6-san-luis.jpg'
const UNMATCHED = 'prime-kitchens-san-luis.mp4'

const base = (value?: string | null) => (value ? value.split('/').pop()! : '')

// ---- 1. the homepage's video -> poster mapping ----------------------------
const home = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'home' } },
  limit: 1,
  depth: 2,
})
const difference = ((home.docs[0] as any)?.layout ?? []).find(
  (b: any) => b.blockType === 'difference',
)
const posterByVideo = new Map<string, number>()
for (const entry of difference?.videos ?? []) {
  const file = base(entry.url) || base(entry.video?.filename)
  if (file && entry.poster?.id) posterByVideo.set(file, entry.poster.id)
}
console.log(`Homepage poster mapping (${posterByVideo.size}):`)
for (const [v, id] of posterByVideo) console.log(`   ${v}  ->  media#${id}`)

// ---- 2. a poster for the clip the homepage does not play -------------------
let framePosterId: number | undefined
const existing = await payload.find({
  collection: 'media',
  where: { filename: { equals: FRAME_NAME } },
  limit: 1,
})
if (existing.docs.length) {
  framePosterId = (existing.docs[0] as any).id
  console.log(`\n${FRAME_NAME} already in Media as #${framePosterId}`)
} else if (write) {
  const created = await payload.create({
    collection: 'media',
    data: { alt: 'The finished kitchen at San Luis Ave, Mountain View' },
    filePath: FRAME_FILE,
  })
  framePosterId = (created as any).id
  console.log(`\nUploaded ${FRAME_NAME} as media#${framePosterId}`)
} else {
  console.log(`\nWould upload ${FRAME_FILE} as ${FRAME_NAME}`)
}

// ---- 3. repoint the testimonial posters -----------------------------------
const pages = await payload.find({
  collection: 'pages',
  where: { slug: { equals: 'testimonials' } },
  limit: 1,
  depth: 2,
})
const page: any = pages.docs[0]
const layout = page.layout ?? []
let changed = 0
const unresolved: string[] = []

for (const block of layout) {
  if (block.blockType !== 'testimonial-videos') continue
  console.log('\nTestimonials clips:')
  for (const clip of block.videos ?? []) {
    const file = base(clip.video?.filename) || base(clip.externalUrl)
    const target = posterByVideo.get(file) ?? (file === UNMATCHED ? framePosterId : undefined)
    const current = clip.poster?.id
    if (!target) {
      unresolved.push(file)
      console.log(`   ? ${file}  — no poster resolved`)
      continue
    }
    if (current === target) {
      console.log(`   = ${file}  already media#${target}`)
      continue
    }
    console.log(`   ${write ? '->' : ' ·'} ${file}  media#${current ?? '—'} => media#${target}`)
    clip.poster = target
    changed++
  }
}

if (write && changed) {
  // Relationship fields must be written back as ids, not the populated docs.
  const flatten = (v: any) => (v && typeof v === 'object' && 'id' in v ? v.id : v)
  for (const block of layout) {
    if (block.blockType !== 'testimonial-videos') continue
    for (const clip of block.videos ?? []) {
      clip.video = flatten(clip.video)
      clip.poster = flatten(clip.poster)
    }
  }
  await payload.update({ collection: 'pages', id: page.id, data: { layout } })
}

if (unresolved.length) console.log(`\n!! no poster resolved for: ${unresolved.join(', ')}`)
console.log(`\n${write ? `Updated ${changed} clip(s).` : 'Dry run — pass "write" to apply.'}`)
process.exit(0)
