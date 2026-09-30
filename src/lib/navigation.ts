import website from '../../website.json'
import { serviceHref } from './services'

/** A menu entry as the header renders it. `href` "#" opens a dropdown only. */
export type NavItem = { label: string; href: string; children?: NavItem[] }

export type FooterLink = { label: string; href: string }

export type NavigationValue = {
  header: NavItem[]
  footer: {
    quickLinks: FooterLink[]
    serviceLinks: FooterLink[]
    copyright: string
    privacyPolicyHref: string
  }
}

/**
 * The local-dev fallback: the values the Navigation global was seeded from.
 * Used only without a database connection — never as evidence that the menu
 * is CMS-driven (CLAUDE.md §6).
 */
const localNavigation: NavigationValue = {
  header: website.nav,
  footer: {
    quickLinks: website.footer.quickLinks,
    serviceLinks: website.footer.serviceLinks,
    copyright: website.footer.copyright,
    privacyPolicyHref: website.footer.privacyPolicyHref,
  },
}

type PayloadLink = {
  label?: string | null
  service?: { slug?: string | null } | number | null
  url?: string | null
}

type PayloadNavigation = {
  header?: {
    items?: Array<PayloadLink & { dropdown?: Array<PayloadLink & { subItems?: PayloadLink[] | null }> | null }> | null
  } | null
  footer?: {
    quickLinks?: Array<{ label?: string | null; url?: string | null }> | null
    serviceLinks?: PayloadLink[] | null
    copyright?: string | null
    privacyPolicyUrl?: string | null
  } | null
}

/** A service link follows the service; anything else is its URL. */
function hrefOf(link: PayloadLink): string | undefined {
  const slug = typeof link.service === 'object' ? link.service?.slug : undefined
  if (slug) return serviceHref(slug)
  return link.url?.trim() || undefined
}

function toLink(link: PayloadLink): FooterLink | undefined {
  const label = link.label?.trim()
  const href = hrefOf(link)
  return label && href ? { label, href } : undefined
}

const present = <T,>(value: T | undefined): value is T => value !== undefined

/**
 * The header menu and the footer's links, from the Navigation global.
 *
 * An entry with no label or nowhere to go is left out rather than rendered
 * blank. A field left empty in the CMS stays empty on the page — the
 * `website.json` values are only used when there is no database at all.
 */
export async function resolveNavigation(): Promise<NavigationValue> {
  if (!process.env.DATABASE_URL) return localNavigation

  const [{ getPayload }, { default: configPromise }] = await Promise.all([
    import('payload'),
    import('@payload-config'),
  ])
  const payload = await getPayload({ config: configPromise })
  const nav = (await payload.findGlobal({ slug: 'navigation', depth: 1 })) as PayloadNavigation

  const header: NavItem[] = (nav.header?.items ?? [])
    .map((item) => {
      const link = toLink(item)
      if (!link) return undefined
      const children = (item.dropdown ?? [])
        .map((child) => {
          const childLink = toLink(child)
          if (!childLink) return undefined
          const nested = (child.subItems ?? []).map(toLink).filter(present)
          return nested.length ? { ...childLink, children: nested } : childLink
        })
        .filter(present)
      return { ...link, children }
    })
    .filter(present)

  return {
    header,
    footer: {
      quickLinks: (nav.footer?.quickLinks ?? [])
        .map((link) => toLink({ label: link.label, url: link.url }))
        .filter(present),
      serviceLinks: (nav.footer?.serviceLinks ?? []).map(toLink).filter(present),
      copyright: nav.footer?.copyright?.trim() ?? '',
      privacyPolicyHref: nav.footer?.privacyPolicyUrl?.trim() ?? '',
    },
  }
}
