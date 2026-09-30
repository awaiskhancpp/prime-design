import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from '@/lib/richText'
import { richTextToPlainText } from '@/lib/richText'
import type { SeoFields } from '@/lib/seo'

export type AboutTeamMember = {
  name: string
  role: string
  description?: string
  image?: string
}

const mediaUrl = (value: unknown) =>
  typeof value === 'object' && value !== null && 'url' in value && typeof value.url === 'string'
    ? value.url
    : undefined

/**
 * Team members from the Payload Team collection. Returns an empty list when
 * there's no database or no members — the team grid then renders nothing
 * rather than a hard-coded list.
 */
export async function resolveTeamMembers(): Promise<AboutTeamMember[]> {
  if (!process.env.DATABASE_URL) return []

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team',
    sort: 'createdAt',
    depth: 2,
    limit: 100,
  })
  return (
    result.docs as unknown as Array<{
      name?: string
      position?: string | null
      bio?: RichTextValue
      image?: unknown
    }>
  )
    .map((record) => ({
      name: typeof record.name === 'string' ? record.name : '',
      role: typeof record.position === 'string' ? record.position : '',
      description: richTextToPlainText(record.bio) || undefined,
      image: mediaUrl(record.image),
    }))
    .filter((member) => member.name)
}

/** One team member's own page (`/team/<slug>`). */
export type TeamMemberDetail = AboutTeamMember & {
  slug: string
  bio?: RichTextValue
  seo?: SeoFields
}

type PayloadTeamRecord = {
  name?: string
  slug?: string
  position?: string | null
  bio?: RichTextValue
  image?: unknown
  seo?: SeoFields
}

const toDetail = (record: PayloadTeamRecord | undefined): TeamMemberDetail | undefined =>
  record?.name && record.slug
    ? {
        name: record.name,
        slug: record.slug,
        role: record.position || '',
        description: richTextToPlainText(record.bio) || undefined,
        bio: record.bio,
        image: mediaUrl(record.image),
        seo: record.seo,
      }
    : undefined

/**
 * A member by slug, for their page. WordPress published one page per member
 * at `/team/<slug>/` — eleven of them, indexed by Google — which this site did
 * not have, so every one of those URLs was a 404. The page is built from the
 * Team record alone; no member has any copy of their own in code.
 */
export async function resolveTeamMember(slug: string): Promise<TeamMemberDetail | undefined> {
  if (!process.env.DATABASE_URL) return undefined
  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'team',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return toDetail(result.docs[0] as unknown as PayloadTeamRecord | undefined)
}
