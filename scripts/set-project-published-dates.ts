import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Give every project its WordPress publish date.
 *
 * `/our-projects` sorted on `createdAt`, which is migration insertion time,
 * and the projects happened to be inserted newest-first — so the page listed
 * them in exactly the reverse of the WordPress order, oldest job first.
 *
 * WordPress orders this archive by post date descending: every project's
 * `wp:menu_order` is 0, so date is the only ordering signal in the export.
 * Reading `wp:post_date` straight out of the XML is therefore enough to
 * reproduce it, and `resolveProjects` now sorts on `-publishedDate`.
 *
 *   npx tsx scripts/set-project-published-dates.ts [xml] [--dry]
 */

const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const xmlPath =
  args.find((value) => !value.startsWith('--')) || 'primedesignampbuild.WordPress.2026-08-28.xml'

const xml = await readFile(xmlPath, 'utf8')

/** slug -> WordPress post_date, for `project` items only. */
const dates = new Map<string, string>()
for (const item of xml.split('<item>').slice(1)) {
  const type = /<wp:post_type><!\[CDATA\[(.*?)\]\]><\/wp:post_type>/.exec(item)?.[1]
  if (type !== 'project') continue
  const slug = /<wp:post_name><!\[CDATA\[(.*?)\]\]><\/wp:post_name>/.exec(item)?.[1]
  // `post_date_gmt` is the unambiguous one; `post_date` is site-local.
  const date =
    /<wp:post_date_gmt><!\[CDATA\[(.*?)\]\]><\/wp:post_date_gmt>/.exec(item)?.[1] ||
    /<wp:post_date><!\[CDATA\[(.*?)\]\]><\/wp:post_date>/.exec(item)?.[1]
  if (slug && date && date !== '0000-00-00 00:00:00')
    dates.set(slug, `${date.replace(' ', 'T')}Z`)
}
console.log(`${dates.size} project date(s) in the export`)

const payload = await getPayload({ config: configPromise })
let changed = 0
let same = 0
let missing = 0

for (const [slug, date] of [...dates].sort((a, b) => b[1].localeCompare(a[1]))) {
  const found = await payload.find({
    collection: 'projects',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const project = found.docs[0] as unknown as Record<string, unknown> | undefined
  if (!project) {
    console.log(`! ${slug}: no project record`)
    missing += 1
    continue
  }
  const current = project.publishedDate ? new Date(String(project.publishedDate)).toISOString() : ''
  const target = new Date(date).toISOString()
  if (current === target) {
    console.log(`= ${slug}: already ${target.slice(0, 10)}`)
    same += 1
    continue
  }
  console.log(`${dryRun ? '~' : '+'} ${target.slice(0, 10)}  ${slug}`)
  changed += 1
  if (dryRun) continue
  await payload.update({
    collection: 'projects',
    id: project.id as number,
    data: { publishedDate: target } as never,
  })
}

console.log(
  `\n${dryRun ? 'dry run — ' : ''}${changed} date(s) ${dryRun ? 'would be set' : 'set'}, ${same} already correct, ${missing} not found`,
)
await payload.destroy()
