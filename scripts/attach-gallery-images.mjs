// Attaches the 99 WordPress gallery images to their gallery-categories
// (kitchens / bathrooms / adu-additions) in the WordPress order.
import pg from '../node_modules/.pnpm/pg@8.20.0/node_modules/pg/esm/index.mjs'
import { readFileSync } from 'node:fs'

const env = readFileSync('.env', 'utf8')
const url = (env.match(/^DATABASE_URL=(.*)$/m)?.[1] || '').trim().replace(/^"(.*)"$/, '$1')
const client = new pg.Client({ connectionString: url })
await client.connect()

const kitchens = [
  [3761, 'Prime-design12.jpg'], [3760, 'Prime-design8.jpg'], [3759, 'prime13.jpg'],
  [3758, 'prime15-1.jpg'], [3757, 'Prime6.jpg'], [3756, 'Prime7-2.jpg'],
  [3755, 'Prime11-3.jpg'], [3754, 'Prime12-2.jpg'], [3753, 'Prime15-2.jpg'],
  [3752, 'prime2-3.jpg'], [3749, 'prime10-3.jpg'], [3748, 'Prime2-4.jpg'],
  [3747, 'Prime5.jpg'], [3746, 'prime9-2.jpg'], [3745, 'prime11-4.jpg'],
  [3744, 'Prime9-3.jpg'], [3743, 'Prime10-4.jpg'],
  [1942, 'WhatsApp-Image-2023-05-31-at-11.59.26-PM.jpeg'],
  [1936, 'WhatsApp-Image-2023-05-31-at-11.47.40-PM.jpeg'],
  [1776, 'WhatsApp-Image-2023-05-30-at-5.23.33-PM.jpeg'],
  [545, 'WhatsApp-Image-2023-05-05-at-8.13.33-PM-1.jpeg'],
  [543, 'WhatsApp-Image-2023-05-05-at-8.13.34-PM-1.jpeg'],
  [541, 'WhatsApp-Image-2023-05-05-at-8.13.35-PM-1.jpeg'],
  [534, 'WhatsApp-Image-2023-05-05-at-8.13.39-PM.jpeg'],
  [528, 'WhatsApp-Image-2023-05-05-at-8.13.42-PM.jpeg'],
  [523, 'WhatsApp-Image-2023-05-05-at-8.13.45-PM.jpeg'],
  [521, 'WhatsApp-Image-2023-05-05-at-8.13.47-PM.jpeg'],
  [503, 'WhatsApp-Image-2023-05-05-at-8.13.57-PM.jpeg'],
  [502, 'WhatsApp-Image-2023-05-05-at-8.13.57-PM-1.jpeg'],
  [499, 'WhatsApp-Image-2023-05-05-at-8.13.59-PM.jpeg'],
  [498, 'WhatsApp-Image-2023-05-05-at-8.13.59-PM-1.jpeg'],
  [496, 'WhatsApp-Image-2023-05-05-at-8.14.01-PM-1.jpeg'],
  [497, 'WhatsApp-Image-2023-05-05-at-8.14.01-PM.jpeg'],
  [494, 'WhatsApp-Image-2023-05-05-at-8.17.57-PM.jpeg'],
  [493, 'WhatsApp-Image-2023-05-05-at-8.17.57-PM-1.jpeg'],
  [492, 'WhatsApp-Image-2023-05-05-at-8.17.57-PM-2.jpeg'],
  [486, 'WhatsApp-Image-2023-05-05-at-8.17.58-PM-1.jpeg'],
  [485, 'WhatsApp-Image-2023-05-05-at-8.17.58-PM-2.jpeg'],
  [482, 'WhatsApp-Image-2023-05-05-at-8.18.54-PM-2.jpeg'],
  [481, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM.jpeg'],
  [480, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM-1.jpeg'],
  [478, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM-3.jpeg'],
  [477, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM-4.jpeg'],
  [476, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM-5.jpeg'],
  [475, 'WhatsApp-Image-2023-05-05-at-8.18.55-PM-6.jpeg'],
  [474, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM.jpeg'],
  [473, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-1.jpeg'],
  [471, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-3.jpeg'],
  [472, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-2.jpeg'],
  [470, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-4.jpeg'],
]
const bathrooms = [
  [3742, 'Prime20-1.jpg'], [3741, 'Prime31.jpg'], [3740, 'Prime32.jpg'],
  [3739, 'Prime33.jpg'], [3738, 'prime16.jpg'], [3737, 'prime19-1.jpg'],
  [3735, 'prime21.jpg'], [3734, 'prime22-1.jpg'], [3733, 'prime23-1.jpg'],
  [3732, 'prime27.jpg'], [3731, 'prime28-2.jpg'], [3729, 'Prime-design19.jpg'],
  [3728, 'Prime-design26.jpg'], [3727, 'Prime-design24.jpg'], [3624, 'Prime26.jpg'],
  [3139, 'lets-start-home-renovation.jpg'],
  [1938, 'WhatsApp-Image-2023-05-31-at-11.47.52-PM.jpeg'],
  [1930, 'WhatsApp-Image-2023-05-31-at-11.39.22-PM.jpeg'],
  [538, 'WhatsApp-Image-2023-05-05-at-8.13.37-PM.jpeg'],
  [537, 'WhatsApp-Image-2023-05-05-at-8.13.37-PM-1.jpeg'],
  [536, 'WhatsApp-Image-2023-05-05-at-8.13.38-PM.jpeg'],
  [530, 'WhatsApp-Image-2023-05-05-at-8.13.41-PM.jpeg'],
  [527, 'WhatsApp-Image-2023-05-05-at-8.13.42-PM-1.jpeg'],
  [525, 'WhatsApp-Image-2023-05-05-at-8.13.43-PM-1.jpeg'],
  [524, 'WhatsApp-Image-2023-05-05-at-8.13.44-PM.jpeg'],
  [517, 'WhatsApp-Image-2023-05-05-at-8.13.50-PM.jpeg'],
  [516, 'WhatsApp-Image-2023-05-05-at-8.13.51-PM.jpeg'],
  [512, 'WhatsApp-Image-2023-05-05-at-8.13.52-PM-1.jpeg'],
  [508, 'WhatsApp-Image-2023-05-05-at-8.13.54-PM-1.jpeg'],
  [509, 'WhatsApp-Image-2023-05-05-at-8.13.54-PM.jpeg'],
  [489, 'WhatsApp-Image-2023-05-05-at-8.17.57-PM-5.jpeg'],
  [488, 'WhatsApp-Image-2023-05-05-at-8.17.57-PM-6.jpeg'],
  [469, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-5.jpeg'],
  [468, 'WhatsApp-Image-2023-05-05-at-8.18.56-PM-6.jpeg'],
  [466, 'WhatsApp-Image-2023-05-05-at-8.18.57-PM-1.jpeg'],
  [465, 'WhatsApp-Image-2023-05-05-at-8.18.57-PM-2.jpeg'],
  [464, 'WhatsApp-Image-2023-05-05-at-8.13.33-PM.jpeg'],
]
const adu = [
  [3772, 'Prime20-1-1.jpg'], [3771, 'Prime22-2.jpg'], [3770, 'Prime26-1.jpg'],
  [3769, 'Prime10-1.jpg'], [3768, 'Prime1-5.jpg'], [3767, 'Prime4-1.jpg'],
  [3766, 'Prime7-2-1.jpg'], [3765, 'Prime9-1.jpg'], [3764, 'Prime12-2-1.jpg'],
  [3763, 'Prime16-1.jpg'], [3762, 'Prime19-1-1.jpg'], [3751, 'prime6-1.jpg'],
]

const groups = [
  ['kitchens', kitchens],
  ['bathrooms', bathrooms],
  ['adu-additions', adu],
]

for (const [slug, items] of groups) {
  const cat = await client.query(`select id from gallery_categories where slug = $1`, [slug])
  if (!cat.rows[0]) {
    console.log(`category ${slug} not found`)
    continue
  }
  const parentId = cat.rows[0].id
  // Payload upload fields store relations in <table>_rels.
  await client.query(`DELETE FROM gallery_categories_rels WHERE parent_id = $1`, [parentId])
  await client.query(
    `DELETE FROM gallery_categories_images WHERE _parent_id = $1`,
    [parentId],
  )
  let order = 0
  for (const [wpId, filename] of items) {
    const media = await client.query(
      `select id from media where filename = $1 or wordpress_id = $2 limit 1`,
      [filename, wpId],
    )
    if (!media.rows[0]) {
      console.log(`MISSING MEDIA ${slug}: ${filename}`)
      continue
    }
    order++
    await client.query(
      `INSERT INTO gallery_categories_rels ("order", parent_id, path, media_id) VALUES ($1, $2, 'images', $3)`,
      [order, parentId, media.rows[0].id],
    )
    await client.query(
      `INSERT INTO gallery_categories_images (_order, _parent_id, media_id) VALUES ($1, $2, $3)`,
      [order, parentId, media.rows[0].id],
    )
  }
  console.log(`${slug}: attached ${order}/${items.length}`)
}

await client.end()
console.log('done')
