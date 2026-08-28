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
    companyPhone?: string | null
    companyPhoneClean?: string | null
    companyEmail?: string | null
    companyLicense?: string | null
    addresses?: Array<{ address?: string | null }> | null
  } | null
  serviceAreas?: Array<{ name?: string | null; slug?: string | null } | number> | null
}

export async function resolveSiteAreas(): Promise<SiteArea[]> {
  if (!process.env.DATABASE_URL) return localAreas

  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as PayloadSiteSettings
  const areas = settings.serviceAreas
    ?.filter((area): area is { name?: string | null; slug?: string | null } => typeof area === 'object')
    .map((area) => ({ name: area.name || '', slug: area.slug || '' }))
    .filter((area) => area.name && area.slug)

  return areas?.length ? areas : localAreas
}

export async function resolveSiteSettings(): Promise<SiteSettingsValue> {
  if (!process.env.DATABASE_URL) return localSettings

  const payload = await getPayload({ config: configPromise })
  const settings = (await payload.findGlobal({ slug: 'site-settings', depth: 1 })) as PayloadSiteSettings
  const company = settings.company

  return {
    phone: company?.companyPhone || localSettings.phone,
    phoneClean:
      company?.companyPhoneClean || company?.companyPhone?.replace(/[^\d+]/g, '') || localSettings.phoneClean,
    email: company?.companyEmail || localSettings.email,
    license: company?.companyLicense || localSettings.license,
    addresses:
      company?.addresses?.map((item) => item.address || '').filter(Boolean) || localSettings.addresses,
  }
}
