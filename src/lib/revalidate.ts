// Invalidates a Next.js cache tag after a Payload collection changes.
// `next/cache` is loaded lazily so this module never pulls server-only
// Next.js internals into the client bundle through payload.config.
export async function revalidateCollection(tag: string) {
  try {
    const { revalidateTag } = await import('next/cache')
    revalidateTag(tag, 'max')
  } catch (error) {
    console.error(`revalidateCollection: failed to revalidate tag "${tag}"`, error)
  }
}
