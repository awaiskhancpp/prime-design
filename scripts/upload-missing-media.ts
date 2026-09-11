// @ts-nocheck
// Upload the locally-available WordPress media files that are missing from
// Vercel Blob, and set per-service hero videos from the WP pages.
import 'dotenv/config'
import { readFile, readFileSync } from 'node:fs'
import { getPayload } from 'payload'
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import configPromise from '../src/payload.config'

const rawEnv2 = readFileSync('.env', 'utf8')
const conn = (rawEnv2.match(/DATABASE_URL=([^\r\n]+)/) || [])[1].replace(/^"(.*)"$/, '$1')

const client = new pg.Client({ connectionString: conn })
await client.connect()
const payload = await getPayload({ config: configPromise })

async function ensureUploaded(localPath, desiredFilename, alt, sourceUrl) {
  const existing = await payload.find({
    collection: 'media',
    where: { filename: { like: desiredFilename } },
    limit: 1,
  })
  if (existing.docs[0] && existing.docs[0].url) {
    console.log(`${desiredFilename}: already in blob (#${existing.docs[0].id})`)
    return Number(existing.docs[0].id)
  }
  const buffer = await readFile(localPath)
  if (existing.docs[0]) {
    const updated = await payload.update({
      collection: 'media',
      id: existing.docs[0].id,
      data: { alt: alt || desiredFilename, sourceUrl: sourceUrl || undefined },
      file: { data: buffer, mimetype: 'video/mp4', name: desiredFilename, size: buffer.length },
    })
    console.log(`${desiredFilename}: uploaded to existing media #${updated.id}`)
    return Number(updated.id)
  }
  const created = await payload.create({
    collection: 'media',
    data: { alt: alt || desiredFilename, sourceUrl: sourceUrl || undefined },
    file: { data: buffer, mimetype: 'video/mp4', name: desiredFilename, size: buffer.length },
  })
  console.log(`${desiredFilename}: created media #${created.id}`)
  return Number(created.id)
}

const SAN_LUIS =
  '01.19.2023 Prime Kitchens 1794 San Luis Ave Mountain View.mp4'
const CRYER =
  '05.03.2023 Daniel CLIENT PRIME KITCHEN (2 videos ) 2365 Cryer St Hayward.mp4'

// 1. Upload the two WP hero videos from the local media folder.
const sanLuisId = await ensureUploaded(
  `media/${SAN_LUIS}`,
  SAN_LUIS,
  'Prime Kitchens San Luis Ave walkthrough',
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/01.19.2023%20Prime%20Kitchens%201794%20San%20Luis%20Ave%20Mountain%20View.mp4',
)
const cryerId = await ensureUploaded(
  `media/${CRYER}`,
  CRYER,
  'Prime Kitchens Cryer St walkthrough',
  'https://tagmediaspace.b-cdn.net/Prime%20Kitchens/05.03.2023%20Daniel%20CLIENT%20PRIME%20KITCHEN%20(2%20videos%20)%202365%20Cryer%20St%20Hayward.mp4',
)

// 2. Upload Finance-Prime-Kitchens.webp (WP used the .png; only the webp copy exists).
let financeId
const financeExisting = await payload.find({
  collection: 'media',
  where: { filename: { like: 'Finance-Prime-Kitchens%' } },
  limit: 1,
})
if (financeExisting.docs[0] && financeExisting.docs[0].url) {
  financeId = Number(financeExisting.docs[0].id)
  console.log(`Finance-Prime-Kitchens: already in blob (#${financeId})`)
} else {
  const buffer = await readFile('media/Finance-Prime-Kitchens.webp')
  const mimetype = 'image/webp'
  const created = await payload.create({
    collection: 'media',
    data: {
      alt: 'Finance with Prime Design & Build',
      sourceUrl:
        'https://primedesignandbuild.com/wp-content/uploads/2024/09/Finance-Prime-Kitchens.png',
    },
    file: { data: buffer, mimetype, name: 'Finance-Prime-Kitchens.webp', size: buffer.length },
  })
  financeId = Number(created.id)
  console.log(`Finance-Prime-Kitchens.webp: created media #${financeId}`)
}

// 3. Per-service hero video (first WP video element on the page) — services
// whose hero image is missing get the video so the hero still shows media.
const heroVideos = {
  1: cryerId,   // kitchen (WP 3261 hero)
  2: cryerId,   // home
  3: sanLuisId, // bathroom
  7: sanLuisId, // adu
  8: cryerId,   // additions
  9: sanLuisId, // complete-renovation
  10: sanLuisId, // european
  11: cryerId,  // custom
  12: cryerId,  // shaker
}
for (const [serviceId, mediaId] of Object.entries(heroVideos)) {
  await client.query(`UPDATE services SET hero_video_id = $1 WHERE id = $2`, [mediaId, serviceId])
  console.log(`service ${serviceId} hero_video → media #${mediaId}`)
}

// 4. Finance hero image → the uploaded webp.
await client.query(`UPDATE services SET hero_image_id = $1 WHERE id = 13`, [financeId])
console.log(`service 13 hero_image → media #${financeId}`)

await client.end()
await payload.destroy()
