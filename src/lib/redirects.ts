import { getPayload } from 'payload'

import configPromise from '@payload-config'

export type RedirectRecord = {
  oldPath: string
  newPath: string
  statusCode: '301' | '302' | '307' | '308'
  active?: boolean | null
}

export async function resolveRedirect(oldPath: string): Promise<RedirectRecord | undefined> {
  if (!process.env.DATABASE_URL) return undefined

  const payload = await getPayload({ config: configPromise })
  const result = await payload.find({
    collection: 'redirects',
    where: {
      and: [{ oldPath: { equals: oldPath } }, { active: { equals: true } }],
    },
    limit: 1,
  })

  return result.docs[0] as unknown as RedirectRecord | undefined
}
