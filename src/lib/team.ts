import { getPayload } from 'payload'

import configPromise from '@payload-config'
import type { RichTextValue } from '@/lib/richText'
import { richTextToPlainText } from '@/lib/richText'

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
  return (result.docs as unknown as Array<{
    name?: string
    position?: string | null
    bio?: RichTextValue
    image?: unknown
  }>)
    .map((record) => ({
      name: typeof record.name === 'string' ? record.name : '',
      role: typeof record.position === 'string' ? record.position : '',
      description: richTextToPlainText(record.bio) || undefined,
      image: mediaUrl(record.image),
    }))
    .filter((member) => member.name)
}
