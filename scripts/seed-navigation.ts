import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'
import website from '../website.json'

/**
 * Fill the `navigation` global from the header and footer links that used to
 * live in `website.json`.
 *
 * The labels are copied exactly: they are the WordPress site's own wording
 * ("ADU" in the header, "ADU" and "Garage Conversion" in the footer, and so
 * on). A `/services/…` link becomes a relationship to that service, so the
 * link follows the service rather than a copied path.
 *
 * One link is corrected on purpose: the footer's "Home Remodel" goes to Home
 * Remodeling, not Complete Renovation, where WordPress sends it (CLAUDE.md
 * §8c).
 *
 *   npx tsx scripts/seed-navigation.ts [--dry] [--force]
 *
 * Refuses to overwrite a navigation that already has header items unless
 * `--force` is given, so edits made in the CMS are not wiped by a re-run.
 */

const dryRun = process.argv.includes('--dry')
const force = process.argv.includes('--force')

const payload = await getPayload({ config: configPromise })
const { docs } = await payload.find({ collection: 'services', depth: 0, limit: 100 })
const services = docs as unknown as Array<{ id: number; slug: string }>
const bySlug = new Map(services.map((service) => [service.slug, service.id]))

/** The last path segment of a service link, with the kitchen styles' `-silicon-valley` suffix removed. */
function serviceFor(href: string): number | undefined {
  const match = href.match(/^\/services\/(?:kitchen-remodeling\/)?([a-z0-9-]+)\/?$/)
  if (!match) return undefined
  const slug = match[1]
  const id = bySlug.get(slug) ?? bySlug.get(slug.replace(/-silicon-valley$/, ''))
  if (id === undefined) throw new Error(`No service for link "${href}"`)
  return id
}

async function pageFor(href: string): Promise<number> {
  const slug = href.replace(/^\/+|\/+$/g, '')
  const { docs: pages } = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 0,
    limit: 1,
  })
  const page = pages[0] as { id: number } | undefined
  if (!page) throw new Error(`No page for link "${href}"`)
  return page.id
}

type NavSource = { label: string; href: string; children?: NavSource[] }

const link = ({ label, href }: NavSource) => {
  const service = serviceFor(href)
  return service ? { label, service } : { label, url: href }
}

const HOME_REMODEL_FIX: Record<string, string> = {
  'Home Remodel': '/services/home-remodeling',
}

const data = {
  header: {
    items: (website.nav as NavSource[]).map((item) => ({
      ...link(item),
      dropdown: (item.children ?? []).map((child) => ({
        ...link(child),
        subItems: (child.children ?? []).map(link),
      })),
    })),
  },
  footer: {
    quickLinks: website.footer.quickLinks.map(({ label, href }) => ({ label, url: href })),
    serviceLinks: website.footer.serviceLinks.map(({ label, href }) => {
      const service = serviceFor(HOME_REMODEL_FIX[label] ?? href)
      if (!service) throw new Error(`Footer link "${label}" is not a service page`)
      return { label, service }
    }),
    copyright: website.footer.copyright,
    // The WordPress footer's wording, linked to the Pages record it names.
    privacyPolicy: { label: 'Privacy Policy', page: await pageFor(website.footer.privacyPolicyHref) },
  },
}

const current = (await payload.findGlobal({ slug: 'navigation', depth: 0 })) as {
  header?: { items?: unknown[] | null } | null
}
if (current.header?.items?.length && !force) {
  console.log('navigation already has header items; pass --force to overwrite. Nothing written.')
  process.exit(0)
}

console.log(JSON.stringify(data, null, 1))
if (dryRun) {
  console.log('--dry: nothing written')
  process.exit(0)
}

await payload.updateGlobal({ slug: 'navigation', data: data as never })
console.log('navigation written')
process.exit(0)
