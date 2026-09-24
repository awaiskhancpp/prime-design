import 'server-only'

import configPromise from '@payload-config'
import { getPayload } from 'payload'

/**
 * The options in the forms' "Service" dropdown.
 *
 * The original site runs Fluent Forms, and its estimate form offers a fixed
 * six: Kitchen Remodeling, Bathroom Remodeling, Home Remodeling, Additions,
 * New Construction / Complete Renovation, ADU & Garage Conversions. Those six
 * are not hardcoded here — they are exactly the services this site already
 * marks as featured with no parent service, in their own sort order, so the
 * dropdown is the Services collection and nothing else. Add a featured
 * service in the admin and it appears in every form; rename one and the
 * dropdown follows.
 *
 * The sub-styles (European, Shaker and Custom Kitchen) are deliberately left
 * out: they carry `parentService`, and a visitor choosing between "Kitchen
 * Remodeling" and "Shaker Kitchen" is being asked a question the sales call
 * exists to answer. The same filter is why "Finance" and "Home Repair
 * Services", which are pages rather than things to quote, stay out.
 */
export type FormServiceOption = {
  /** Stored on the submission as the relationship target. */
  id: number
  /** Posted by the browser; the API resolves it back to `id`. */
  slug: string
  /** What the dropdown shows. */
  title: string
}

export async function resolveFormServices(): Promise<FormServiceOption[]> {
  if (!process.env.DATABASE_URL) return []

  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'services',
    where: {
      featured: { equals: true },
      // Payload stores an unset relationship as null; both spellings are
      // needed because a service that has never been edited has no row value
      // at all rather than an explicit null.
      or: [{ parentService: { exists: false } }, { parentService: { equals: null } }],
    },
    sort: 'sortOrder',
    limit: 50,
    depth: 0,
  })

  return docs.flatMap((doc) => {
    const { id, slug, title } = doc as { id: number; slug?: string | null; title?: string | null }
    if (!slug || !title) return []
    return [{ id, slug, title }]
  })
}
