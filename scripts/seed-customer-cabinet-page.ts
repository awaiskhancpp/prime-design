import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Create the missing `pages` record for `/customer-cabinet`.
 *
 * SOURCE. Read from the rendered `<head>` and `<body>` of
 * https://primedesignandbuild.com/customer-cabinet/. The entire body content
 * of that page is:
 *
 *   <h1>Customer Cabinet</h1>
 *   <div class="latepoint-w"><div class="os-form-w latepoint-login-form-w">
 *     <div>Customer authentication is disabled</div>
 *   </div></div>
 *
 * "Customer Cabinet" is LatePoint's (the booking plugin) name for a customer
 * account/login area, and the site owner has that feature switched off — the
 * page has no cabinetry content at all. The Rank Math title/description are
 * seeded verbatim anyway, exactly as WordPress serves them, even though the
 * description ("Discover custom cabinets…") does not describe what is
 * actually on the page — that mismatch is Rank Math's own auto-generated
 * copy, not something to invent a fix for here.
 *
 * `ogImage` is media 660 (`Prime-Kitchens-Open-Graph.gif`), the same
 * site-wide image every other page record uses, confirmed against this
 * page's own `og:image` tag.
 *
 *   npx tsx scripts/seed-customer-cabinet-page.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

const OG_IMAGE_ID = 660

const seed = {
  title: 'Customer Cabinet',
  slug: 'customer-cabinet',
  hero: {
    heading: 'Customer Cabinet',
    description: 'Customer authentication is disabled.',
  },
  seo: {
    metaTitle: 'Customer Cabinet | Prime Design & Build',
    metaDescription:
      "Discover custom cabinets by Prime Design & Build. Tailored designs, quality materials, and expert craftsmanship to enhance your home's functionality and style.",
    canonicalUrl: 'https://primedesignandbuild.com/customer-cabinet',
    noIndex: false,
    ogTitle: 'Customer Cabinet | Prime Design & Build',
    ogDescription:
      "Discover custom cabinets by Prime Design & Build. Tailored designs, quality materials, and expert craftsmanship to enhance your home's functionality and style.",
    ogImage: OG_IMAGE_ID,
  },
}

const payload = await getPayload({ config: configPromise })

const existing = await payload.find({
  collection: 'pages',
  where: { slug: { equals: seed.slug } },
  limit: 1,
})
const record = existing.docs[0]

if (dryRun) {
  console.log(`${record ? 'would update' : 'would create'}  ${seed.slug}`)
} else if (record) {
  await payload.update({ collection: 'pages', id: record.id, data: { ...seed } as never })
  console.log(`updated  ${seed.slug} (id ${record.id})`)
} else {
  const created = await payload.create({ collection: 'pages', data: { ...seed } as never })
  console.log(`created  ${seed.slug} (id ${created.id})`)
}

process.exit(0)
