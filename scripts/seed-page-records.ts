import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config'

/**
 * Create the missing `pages` records for `/team`, `/services`,
 * `/privacy-policy` and `/thank-you`.
 *
 * Those four routes carried their SEO as string literals in the route file,
 * so nothing about them was editable in the admin. Every other top-level page
 * (`about`, `our-projects`, `contact`, `gallery`, `blog`, `faq`,
 * `testimonials`, `home`) already has a record whose SEO group wins over the
 * route's fallback — these four were simply never created.
 *
 * SOURCE. The title/description/og values below are the live Rank Math output
 * of the WordPress originals, read from the rendered `<head>` of
 * https://primedesignandbuild.com/{team,services,privacy-policy,thank-you}/
 * rather than retyped. The repo's WXR export contains attachments only, so it
 * is not a usable source for page metadata. Two of them differ from the
 * literals the route files carried, in both cases by letter case:
 *
 *   team      WP "Experts At Prime Design"  vs route "Experts at Prime Design"
 *   services  WP "Remodeling By Prime"      vs route "Remodeling by Prime"
 *
 * The WordPress casing wins, since that is what is indexed today.
 *
 * `ogImage` is media 660 (`Prime-Kitchens-Open-Graph.gif`) — the same
 * attachment WordPress serves as `og:image` on all four pages, and the same
 * one the existing `home`/`about`/`gallery`/`blog`/`our-projects` records use.
 *
 * The `services` hero is seeded with the copy `ServicesPage` was already
 * rendering from its own literals, verbatim, so this is a pure
 * source-of-truth move with no visual change. It does NOT match WordPress
 * word for word — see the gap note on that entry below.
 *
 *   npx tsx scripts/seed-page-records.ts [--dry]
 */

const dryRun = process.argv.slice(2).includes('--dry')

/** `Prime-Kitchens-Open-Graph.gif` — the site-wide WordPress OG image. */
const OG_IMAGE_ID = 660

type PageSeed = {
  title: string
  slug: string
  hero?: Record<string, unknown>
  seo: {
    metaTitle: string
    metaDescription?: string
    canonicalUrl?: string
    noIndex?: boolean
    ogTitle: string
    ogDescription?: string
    ogImage: number
  }
}

const seeds: PageSeed[] = [
  {
    title: 'Team',
    slug: 'team',
    seo: {
      metaTitle: 'Team | Home Remodeling Experts At Prime Design & Build - Silicon Valley',
      metaDescription:
        'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley. Learn about our skilled professionals dedicated to exceptional results.',
      canonicalUrl: 'https://primedesignandbuild.com/team',
      noIndex: false,
      ogTitle: 'Team | Home Remodeling Experts At Prime Design & Build - Silicon Valley',
      ogDescription:
        'Meet the talented team at Prime Design & Build, experts in home remodeling in Silicon Valley. Learn about our skilled professionals dedicated to exceptional results.',
      ogImage: OG_IMAGE_ID,
    },
  },
  {
    title: 'Services',
    slug: 'services',
    /**
     * `ServicesPage` already reads `hero` from this record and falls back to
     * its own literals when there is none. The values here are those literals,
     * unchanged, so the rendered page is byte-identical before and after — the
     * point of this entry is that the copy now lives in the CMS.
     *
     * GAP (not applied here — it would change what the page says): WordPress
     * words the hero slightly differently. It reads "Now is the perfect
     * *moment* to choose…" where the site says "perfect *time*", and it ends
     * with a further sentence the site drops entirely: "Plus, we offer
     * flexible financing options available for your project.", in which
     * "financing" is a link to /finance. `PageHero`'s `description` is plain
     * text and has no slot for that link.
     *
     * `image` is media 94, the WordPress hero attachment
     * (`WhatsApp-Image-2024-03-04-at-10.17.43-PM.jpeg`). It is byte-identical
     * (md5 ef927252c349aa4cd5708d6c102b988f, 1047x728) to the
     * `public/services/home-remodeling.jpeg` the component falls back to, so
     * the photograph on screen does not change — it just stops being a public
     * file path and becomes a real Media reference.
     */
    hero: {
      eyebrow: 'Our services',
      heading: 'Take charge of your remodeling experience',
      description:
        'Now is the perfect time to choose the area in your home that deserves a remarkable transformation.',
      image: 94,
    },
    seo: {
      metaTitle: 'Services | Home Remodeling By Prime Design & Build - Silicon Valley Experts',
      metaDescription:
        'Discover Prime Design & Build’s home remodeling services in Silicon Valley. From kitchen to whole-house renovations, our team delivers exceptional craftsmanship and tailored solutions.',
      canonicalUrl: 'https://primedesignandbuild.com/services',
      noIndex: false,
      ogTitle: 'Services | Home Remodeling By Prime Design & Build - Silicon Valley Experts',
      ogDescription:
        'Discover Prime Design & Build’s home remodeling services in Silicon Valley. From kitchen to whole-house renovations, our team delivers exceptional craftsmanship and tailored solutions.',
      ogImage: OG_IMAGE_ID,
    },
  },
  {
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    /**
     * CORRECTED entity name. Rank Math's description reads "Read Prime
     * Kitchens' Privacy Policy …" — the former trading name, which the policy
     * text itself also used until `seed-utility-page-content.ts` put the
     * corrected wording in the CMS. Leaving it here would have the page's own
     * search snippet name a company that no longer trades under that name,
     * directly under a policy that names the current one. Everything else is
     * WordPress's wording.
     */
    seo: {
      metaTitle: 'Privacy Policy | Prime Design & Build',
      metaDescription:
        "Read Prime Design & Build's Privacy Policy to understand how we collect, use, and protect your personal information when you visit our website or use our services.",
      canonicalUrl: 'https://primedesignandbuild.com/privacy-policy',
      noIndex: false,
      ogTitle: 'Privacy Policy | Prime Design & Build',
      ogDescription:
        "Read Prime Design & Build's Privacy Policy to understand how we collect, use, and protect your personal information when you visit our website or use our services.",
      ogImage: OG_IMAGE_ID,
    },
  },
  {
    title: 'Thank You',
    slug: 'thank-you',
    seo: {
      metaTitle: 'Thank You | Prime Design & Build',
      /**
       * AUTHORED, not migrated: the WordPress page emits no meta description
       * at all. This is the string `/thank-you/page.tsx` already carried, kept
       * so the record is the single source rather than half of one.
       */
      metaDescription:
        'Thanks for getting in touch — a member of our team will be with you shortly.',
      /**
       * DELIBERATE DIVERGENCE from WordPress, which serves this page as
       * "follow, index". A post-submission confirmation page has no business
       * in search results — the same reasoning already written on the
       * `noIndex` field in `collections/fields/SEO.ts` ("Tick only for pages
       * that should stay out of Google (thank-you pages, duplicates)") and in
       * the route file this replaces.
       */
      noIndex: true,
      ogTitle: 'Thank You | Prime Design & Build',
      ogDescription:
        'Thanks for getting in touch — a member of our team will be with you shortly.',
      ogImage: OG_IMAGE_ID,
    },
  },
]

const payload = await getPayload({ config: configPromise })

for (const seed of seeds) {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: seed.slug } },
    limit: 1,
  })
  const record = existing.docs[0]

  if (dryRun) {
    console.log(`${record ? 'would update' : 'would create'}  ${seed.slug}`)
    continue
  }

  if (record) {
    await payload.update({
      collection: 'pages',
      id: record.id,
      data: { ...seed } as never,
    })
    console.log(`updated  ${seed.slug} (id ${record.id})`)
  } else {
    const created = await payload.create({ collection: 'pages', data: { ...seed } as never })
    console.log(`created  ${seed.slug} (id ${created.id})`)
  }
}

process.exit(0)
