import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Fill `projects.excerpt` — the card copy on the homepage project tiles.
 *
 * WordPress wrote a `summary` for only 6 of the 18 projects, and five of the
 * six the homepage features have none, so there was nothing to migrate: the
 * tiles showed a photo and a title and nothing else.
 *
 * Each line below is written for the card. Where WordPress does have copy
 * for the project, the line is condensed from that copy and marked
 * `wordpress` — those keep the real specifics (the soft colours, the dark
 * cabinets against white counters). Where it does not, the line is marked
 * `written` and stays to what the record actually establishes: the type of
 * work and the city. Nothing here invents a detail about a house — no room
 * counts, no materials, no client stories that the export does not contain.
 *
 *   npx tsx scripts/set-project-excerpts.ts [--dry]
 */

const dryRun = process.argv.includes('--dry')

const EXCERPTS: Array<{ slug: string; excerpt: string; source: 'wordpress' | 'written' }> = [
  // --- The six the homepage features, in WordPress's grid order ---
  {
    slug: 'atherton-kitchen-remodeling-projects',
    excerpt: 'Kitchen remodeling in Atherton, carried from the layout and cabinetry through to the finished room.',
    source: 'written',
  },
  {
    slug: 'full-home-remodeling-los-gatos',
    excerpt: 'New home construction in Los Gatos, taken from the ground up through to the final finishes.',
    source: 'written',
  },
  {
    slug: 'full-home-remodeling-cupertino',
    excerpt: 'A full home remodel in Cupertino, updating the living spaces throughout the house.',
    source: 'written',
  },
  {
    slug: 'sunnyvale-complete-home-renovation',
    excerpt: 'A complete renovation in Sunnyvale, reworking the home room by room.',
    source: 'written',
  },
  {
    slug: 'san-mateo-complete-home-remodel',
    excerpt: 'A complete home remodel in San Mateo, refreshing the interior from end to end.',
    source: 'written',
  },
  {
    slug: 'san-jose-complete-home-remodel',
    excerpt: 'A complete home remodel in San Jose, bringing the whole house into one cohesive design.',
    source: 'written',
  },

  // --- The rest of the catalogue ---
  {
    slug: 'designing-with-intent-creating-homes-that-tell-a-story',
    excerpt: "A Redwood City remodel shaped around how the family lives, with the home's original character kept intact.",
    source: 'written',
  },
  {
    slug: 'mountain-view-beautiful-kitchen-remodel',
    excerpt: 'A Mountain View kitchen remodel, opened up for both cooking and gathering.',
    source: 'written',
  },
  {
    slug: 'pleasanton-kitchen-remodel',
    excerpt: 'A Pleasanton kitchen rebuilt around a more workable layout.',
    source: 'written',
  },
  {
    slug: 'morgan-hill-full-home-remodel',
    excerpt: 'A full home remodel in Morgan Hill, updating the living spaces throughout.',
    source: 'written',
  },
  {
    slug: 'san-rafael-decking-project',
    excerpt: "Exterior decking built in San Rafael, extending the home's living space outdoors.",
    source: 'written',
  },
  {
    slug: 'full-home-remodel-mountain-view',
    excerpt: 'A full renovation covering the living area, kitchen, bathroom and front yard, in soft, warm colors.',
    source: 'wordpress',
  },
  {
    slug: 'kitchen-remodeling-hayward',
    excerpt: 'A kitchen remodel focused on function as much as looks, with room to cook and room for family.',
    source: 'wordpress',
  },
  {
    slug: 'home-remodeling-sunnyvale',
    excerpt: 'A Sunnyvale home remodel, updating the main living spaces throughout the house.',
    source: 'written',
  },
  {
    slug: 'bathroom-home-remodel-in-san-jose',
    excerpt: 'A primary bathroom remodel in San Jose, designed and built in house.',
    source: 'wordpress',
  },
  {
    slug: 'complete-remodel-kitchen-and-two-bathrooms-interior-and-exterior-paint-and-flooring-in-san-mateo',
    excerpt: 'The kitchen and two bathrooms remodeled, plus interior paint and flooring for the whole house.',
    source: 'wordpress',
  },
  {
    slug: 'kitchen-remodel-mountain-view',
    excerpt: 'An outdated kitchen taken all the way down and rebuilt with new cabinets, countertops and appliances.',
    source: 'wordpress',
  },
  {
    slug: 'beautiful-kitchen-remodel-completed-december-2021',
    excerpt: 'Dark cabinets set against white countertops and appliances, for contrast that carries the room.',
    source: 'wordpress',
  },
]

const payload = await getPayload({ config: configPromise })
let changed = 0
let same = 0
let missing = 0

for (const { slug, excerpt, source } of EXCERPTS) {
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
  if (project.excerpt === excerpt) {
    console.log(`= ${slug}`)
    same += 1
    continue
  }
  console.log(`${dryRun ? '~' : '+'} ${slug}  [${source}]\n    ${excerpt}`)
  changed += 1
  if (dryRun) continue
  await payload.update({
    collection: 'projects',
    id: project.id as number,
    data: { excerpt } as never,
  })
}

const written = EXCERPTS.filter((entry) => entry.source === 'written').length
console.log(
  `\n${dryRun ? 'dry run — ' : ''}${changed} excerpt(s) ${dryRun ? 'would be set' : 'set'}, ${same} already correct, ${missing} not found` +
    `\n(${EXCERPTS.length - written} condensed from WordPress copy, ${written} written from the project's type and city)`,
)
await payload.destroy()
