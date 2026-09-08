import { getPayload } from 'payload'

import configPromise from '@payload-config'
import website from '../../website.json'

export type SiteSettingsValue = {
  phone: string
  phoneClean: string
  email: string
  license: string
  addresses: string[]
}

export type SiteArea = { name: string; slug: string }

const localSettings: SiteSettingsValue = {
  phone: website.footer.phone,
  phoneClean: website.footer.phone.replace(/[^\d+]/g, ''),
  email: website.footer.email,
  license: website.meta.license,
  addresses: website.footer.addresses,
}

const localAreas: SiteArea[] = website.serviceAreas.cities.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
}))

type PayloadSiteSettings = {
  company?: {
    name?: string | null
    phone?: string | null
    phoneClean?: string | null
    email?: string | null
    license?: string | null
    addresses?: Array<{ address?: string | null }> | null
  } | null
  serviceAreas?: Array<{ location?: { name?: string | null; slug?: string | null } } | number> | null
}

export async function resolveSiteAreas(): Promise<SiteArea[]> {
  if (!process.env.DATABASE_URL) return localAreas

  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as PayloadSiteSettings
  const areas = settings.serviceAreas
    ?.filter((area): area is { location?: { name?: string | null; slug?: string | null } } =>
      typeof area === 'object',
    )
    .map((area) => ({
      name: area.location?.name || '',
      slug: area.location?.slug || area.location?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '',
    }))
    .filter((area) => area.name)

  return areas?.length ? areas : localAreas
}

export async function resolveSiteSettings(): Promise<SiteSettingsValue> {
  if (!process.env.DATABASE_URL) return localSettings

  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as PayloadSiteSettings
  const company = settings.company

  return {
    phone: company?.phone || localSettings.phone,
    phoneClean:
      company?.phoneClean || company?.phone?.replace(/[^\d+]/g, '') || localSettings.phoneClean,
    email: company?.email || localSettings.email,
    license: company?.license || localSettings.license,
    addresses:
      company?.addresses?.map((item) => item.address || '').filter(Boolean) || localSettings.addresses,
  }
}
