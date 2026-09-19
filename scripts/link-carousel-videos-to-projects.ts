import 'dotenv/config'
import { writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'

/**
 * Attach the homepage carousel's walkthrough clips to their projects.
 *
 * The homepage difference carousel and the Projects collection are joined by
 * the video file itself: `resolveProjectHrefByVideo` keys projects by their
 * video's filename and the carousel looks the current clip up in that map. So
 * linking a clip to a project means recording that clip as the project's
 * video — which is also what makes it play on the project page.
 *
 * Only clips the project owner has identified are listed. Two of the five
 * matched a project on filename already (Atherton, Mountain View kitchen);
 * these are the ones whose filenames did not line up.
 *
 *   npx tsx scripts/link-carousel-videos-to-projects.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

const LINKS: Array<{ slug: string; video: string; note: string }> = [
  {
    slug: 'full-home-remodeling-los-gatos',
    video: '/api/media/file/noah-prime-intro.mp4',
    note: 'clip 1 — its summary describes the Los Gatos remodel',
  },
  {
    slug: 'morgan-hill-full-home-remodel',
    video: '/api/media/file/josef-bluebonnet-morgan-hill.mp4',
    note: 'clip 4 — Josef; identified by the project owner',
  },
  {
    slug: 'bathroom-home-remodel-in-san-jose',
    video: '/api/media/file/first-floor-renovation.mp4',
    // This project already had `showcase-video-1.mp4`. A project holds one
    // video, so linking the carousel clip replaces it — the previous value
    // goes to the backup file below.
    note: 'clip 5 — Sondra & Mark; identified by the project owner (replaces an existing video)',
  },
]

type PgClient = {
  connect(): Promise<void>
  query<Row>(text: string, values?: unknown[]): Promise<{ rows: Row[]; rowCount: number | null }>
  end(): Promise<void>
}
const { Client } = createRequire(import.meta.url)('pg') as {
  Client: new (config: { connectionString?: string }) => PgClient
}

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

/** Only non-null values that get overwritten — those are the losable ones. */
const replaced: Array<{ slug: string; was: string }> = []

for (const { slug, video, note } of LINKS) {
  const found = await client.query<{ video_url: string | null }>(
    `select video_url from projects where slug = $1`,
    [slug],
  )
  if (!found.rows.length) {
    console.log(`! ${slug}: no such project`)
    continue
  }
  const current = found.rows[0].video_url
  if (current === video) {
    console.log(`= ${slug}: already linked`)
    continue
  }
  console.log(`${dryRun ? '~' : '+'} ${slug}  (${note})`)
  console.log(`    ${JSON.stringify(current)} -> ${JSON.stringify(video)}`)
  if (current) replaced.push({ slug, was: current })
  if (!dryRun) await client.query(`update projects set video_url = $2 where slug = $1`, [slug, video])
}

if (!dryRun && replaced.length) {
  const file = `project-video-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
  await writeFile(file, JSON.stringify(replaced, null, 2))
  console.log(`
replaced a video that was already set — previous values in ${file}`)
}

await client.end()
