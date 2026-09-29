import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Removes the "350+ / Projects built" stat from every `ProjectsTrustIntro`
 * data source.
 *
 * That section's eyebrow already says "Over 350+ Projects in Silicon
 * Valley" — the floating stat card next to it repeated the identical claim a
 * second time, right above the same image. The card's other stat ("4.9 /
 * 120+ reviews") says something the eyebrow doesn't, so it stays.
 *
 * This is a content fix, not a component change: `ProjectsTrustIntro`
 * renders whatever `stats` it is given, with no hardcoded copy of its own
 * (see the component's own doc comment), so the duplicate lived in the data
 * — four `services` records' `siliconValleyLoves.stats`, and the
 * `site-settings` global's `trustIntro.stats` (the Projects page). Both are
 * exactly where `ProjectsTrustIntro` is rendered from (`ServiceDetailPage`
 * and `ProjectsPage`), confirmed by reading the live values before writing:
 * every one of them carried `{ value: "350+", label: "Projects built" }`
 * verbatim, so this drops that literal entry rather than guessing at a
 * pattern.
 *
 *   npx tsx scripts/remove-duplicate-projects-built-stat.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

type Stat = { value?: string | null; label?: string | null }

const isProjectsBuiltStat = (stat: Stat) => stat?.label?.trim() === 'Projects built'

const payload = await getPayload({ config: configPromise })

// 1. Every `services` record's `siliconValleyLoves.stats`.
const services = await payload.find({ collection: 'services', limit: 200, depth: 0 })
for (const service of services.docs) {
  const stats = (service as unknown as { siliconValleyLoves?: { stats?: Stat[] } }).siliconValleyLoves
    ?.stats
  if (!stats?.some(isProjectsBuiltStat)) continue

  const nextStats = stats.filter((stat) => !isProjectsBuiltStat(stat))
  console.log(
    `${dryRun ? 'would update' : 'updating'}  services/${service.slug} (id ${service.id}): ` +
      `${stats.length} stats -> ${nextStats.length}`,
  )
  if (!dryRun) {
    await payload.update({
      collection: 'services',
      id: service.id,
      data: { siliconValleyLoves: { stats: nextStats } } as never,
    })
  }
}

// 2. The `site-settings` global's `trustIntro.stats` (the Projects page).
const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
const trustStats = (settings as unknown as { trustIntro?: { stats?: Stat[] } }).trustIntro?.stats
if (trustStats?.some(isProjectsBuiltStat)) {
  const nextStats = trustStats.filter((stat) => !isProjectsBuiltStat(stat))
  console.log(
    `${dryRun ? 'would update' : 'updating'}  site-settings.trustIntro: ` +
      `${trustStats.length} stats -> ${nextStats.length}`,
  )
  if (!dryRun) {
    await payload.updateGlobal({
      slug: 'site-settings',
      data: { trustIntro: { stats: nextStats } } as never,
    })
  }
} else {
  console.log('site-settings.trustIntro: no "Projects built" stat found — nothing to do.')
}

process.exit(0)
