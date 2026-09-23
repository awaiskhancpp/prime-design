import website from '../../website.json'

/**
 * Payload is loaded lazily so this module stays safe to import from client
 * components (SiteHeader renders the settings phone number): in the browser
 * `process.env.DATABASE_URL` is unset and the local fallback is returned
 * before the server-only Payload modules are ever touched.
 */
const payloadImports = () =>
  Promise.all([import('payload'), import('@payload-config')]) as Promise<
    [typeof import('payload'), typeof import('@payload-config')]
  >

export type SiteAddress = { address: string; link?: string }

/**
 * Where an address points when nobody has given it a link.
 *
 * Only the first office carries one in Site Settings — the Google Business
 * profile — so the second rendered as plain text everywhere it appeared: the
 * footer, the homepage contact block and the landing pages' estimate band.
 * Two addresses side by side, one clickable and one not, reads as a broken
 * link rather than as a deliberate difference.
 *
 * Resolving the address text through Google's search keeps the destination
 * honest: nothing is invented, the pin is whatever Google makes of the
 * address the CMS actually stores, and editing that address in Payload moves
 * the link with it. An explicit `link` always wins, so the first office still
 * goes to the Business profile.
 */
export const addressMapsUrl = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

const withAddressLinks = (addresses: SiteAddress[]): SiteAddress[] =>
  addresses
    .filter((entry) => entry.address)
    .map((entry) => ({ ...entry, link: entry.link || addressMapsUrl(entry.address) }))

export type SiteSettingsValue = {
  name: string
  phone: string
  phoneClean: string
  phoneCta: string
  email: string
  emailLink: string
  license: string
  hours: string
  addresses: SiteAddress[]
  socialLinks: {
    googleBusiness?: string
    yelp?: string
    houzz?: string
    bbb?: string
  }
  topBanner?: { enabled?: boolean | null }
  company?: {
    name?: string | null
    email?: string | null
    emailLink?: string | null
    phone?: string | null
    phoneClean?: string | null
    phoneCta?: string | null
    license?: string | null
    hours?: string | null
    mapsUrl?: string | null
    serviceRegion?: string | null
    addresses?: Array<{ address?: string | null; link?: string | null }> | null
  }
  /** Trust section ("Silicon Valley loves working with us!") for the Projects page. */
  trustIntro?: {
    eyebrow?: string
    heading?: string
    body?: string
    image?: string
    stats?: Array<{ value?: string; label?: string; showStars?: boolean }>
    buttons?: Array<{ label: string; url: string; variant?: string }>
  }
}

/** `latitude`/`longitude` drive this area's pin on the coverage map. They are
 *  optional because a location record can exist before anyone sets them; the
 *  map reports any area it cannot place rather than dropping it silently. */
export type SiteArea = { name: string; slug: string; latitude?: number; longitude?: number }

// Canonical fallback values (harvested from the live WordPress site; the
// ACF option values WordPress did not export).
const GOOGLE_BUSINESS = 'https://maps.google.com/?cid=11837063325613881352'
const BBB_PROFILE =
  'https://www.bbb.org/us/ca/campbell/profile/general-contractor/prime-design-and-build-1216-1000033829'

const localSettings: SiteSettingsValue = {
  name: website.meta.siteName,
  phone: website.footer.phone,
  phoneClean: website.footer.phone.replace(/[^\d+]/g, ''),
  phoneCta: website.header.phoneCta,
  email: website.footer.email,
  emailLink: `mailto:${website.footer.email}`,
  license: website.meta.license,
  hours: website.header.hours,
  // WordPress contact template: address 1 links to the Google Business
  // profile, address 2 is plain text.
  addresses: withAddressLinks([
    { address: website.footer.addresses[0], link: GOOGLE_BUSINESS },
    { address: website.footer.addresses[1] },
  ]),
  socialLinks: {
    googleBusiness: GOOGLE_BUSINESS,
    yelp: website.reviewSummary.yelp.url,
    houzz:
      'https://www.houzz.com/professionals/kitchen-and-bath-remodelers/prime-kitchens-pfvwus-pf~508047204',
    bbb: BBB_PROFILE,
  },
}

const localAreas: SiteArea[] = website.serviceAreas.cities.map((name) => ({
  name,
  slug: name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, ''),
}))

type PayloadSiteSettings = {
  topBanner?: { enabled?: boolean | null } | null
  company?: {
    name?: string | null
    phone?: string | null
    phoneClean?: string | null
    phoneCta?: string | null
    email?: string | null
    emailLink?: string | null
    license?: string | null
    hours?: string | null
    mapsUrl?: string | null
    serviceRegion?: string | null
    addresses?: Array<{ address?: string | null; link?: string | null }> | null
  } | null
  socialLinks?: {
    googleBusiness?: string | null
    yelp?: string | null
    houzz?: string | null
    bbb?: string | null
  } | null
  serviceAreas?: Array<
    | {
        location?: {
          name?: string | null
          slug?: string | null
          latitude?: number | null
          longitude?: number | null
        }
      }
    | number
  > | null
  trustIntro?: {
    eyebrow?: string | null
    heading?: string | null
    body?: string | null
    image?: { url?: string | null } | number | null
    stats?: Array<{
      value?: string | null
      label?: string | null
      showStars?: boolean | null
    }> | null
    buttons?: Array<{ label?: string | null; url?: string | null; variant?: string | null }> | null
  } | null
}

/** Payload stores a `number` field as Postgres `numeric`, which comes back as
 *  a string through some driver paths — coerce rather than trust the type. */
const numberOr = (value: number | string | null | undefined) => {
  const parsed = typeof value === 'string' ? Number(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined
}

const textOr = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() ? value : undefined

const mediaUrl = (value: { url?: string | null } | number | null | undefined) =>
  value && typeof value === 'object' && typeof value.url === 'string' ? value.url : undefined

export async function resolveSiteAreas(): Promise<SiteArea[]> {
  if (!process.env.DATABASE_URL) return localAreas

  const [{ getPayload }, { default: configPromise }] = await payloadImports()
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })) as PayloadSiteSettings
  const areas = settings.serviceAreas
    ?.filter(
      (
        area,
      ): area is {
        location?: {
          name?: string | null
          slug?: string | null
          latitude?: number | null
          longitude?: number | null
        }
      } => typeof area === 'object',
    )
    .map((area) => ({
      name: area.location?.name || '',
      slug:
        area.location?.slug ||
        area.location?.name
          ?.toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '') ||
        '',
      latitude: numberOr(area.location?.latitude),
      longitude: numberOr(area.location?.longitude),
    }))
    .filter((area) => area.name)

  return areas?.length ? areas : localAreas
}

export async function resolveSiteSettings(): Promise<SiteSettingsValue> {
  if (!process.env.DATABASE_URL) return localSettings

  const [{ getPayload }, { default: configPromise }] = await payloadImports()
  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({
    slug: 'site-settings',
    depth: 1,
  })) as PayloadSiteSettings
  const company = settings.company
  const social = settings.socialLinks
  const trustRaw = settings.trustIntro

  return {
    name: textOr(company?.name) || localSettings.name,
    phone: textOr(company?.phone) || localSettings.phone,
    phoneClean:
      textOr(company?.phoneClean) ||
      company?.phone?.replace(/[^\d+]/g, '') ||
      localSettings.phoneClean,
    phoneCta: textOr(company?.phoneCta) || localSettings.phoneCta,
    email: textOr(company?.email) || localSettings.email,
    emailLink:
      textOr(company?.emailLink) || `mailto:${textOr(company?.email) || localSettings.email}`,
    license: textOr(company?.license) || localSettings.license,
    hours: textOr(company?.hours) || localSettings.hours,
    addresses: company?.addresses
      ? withAddressLinks(
          company.addresses.flatMap((item): SiteAddress[] => {
            const address = textOr(item.address)
            if (!address) return []
            return [{ address, link: textOr(item.link) }]
          }),
        )
      : localSettings.addresses,
    socialLinks: {
      googleBusiness: textOr(social?.googleBusiness) || localSettings.socialLinks.googleBusiness,
      yelp: textOr(social?.yelp) || localSettings.socialLinks.yelp,
      houzz: textOr(social?.houzz) || localSettings.socialLinks.houzz,
      bbb: textOr(social?.bbb) || localSettings.socialLinks.bbb,
    },
    topBanner: settings.topBanner ?? undefined,
    company: settings.company ?? undefined,
    // Trust section (Projects page) — authored in Site Settings.
    trustIntro: trustRaw
      ? {
          eyebrow: textOr(trustRaw.eyebrow),
          heading: textOr(trustRaw.heading),
          body: textOr(trustRaw.body),
          image: mediaUrl(trustRaw.image),
          stats: (trustRaw.stats ?? []).map((stat) => ({
            value: textOr(stat?.value),
            label: textOr(stat?.label),
            showStars: Boolean(stat?.showStars),
          })),
          buttons: (trustRaw.buttons ?? []).flatMap((button) =>
            textOr(button?.label) && textOr(button?.url)
              ? [
                  {
                    label: textOr(button?.label)!,
                    url: textOr(button?.url)!,
                    variant: textOr(button?.variant),
                  },
                ]
              : [],
          ),
        }
      : undefined,
  }
}
