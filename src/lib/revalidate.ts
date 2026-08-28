import { revalidateTag } from 'next/cache'

/**
 * Invalidates a Next.js cache tag after a Payload collection changes.
 * Wrap in try/catch — this runs inside Payload hooks, and a cache-invalidation
 * failure should never fail the actual save.
 */
export function revalidateCollection(tag: string) {
  try {
    revalidateTag(tag, 'max')
  } catch (error) {
    console.error(`revalidateCollection: failed to revalidate tag "${tag}"`, error)
  }
}
