import NextImage, { type ImageProps } from 'next/image'

/**
 * `next/image` with this site's default quality.
 *
 * Next has no configuration option for a default quality — `quality` is a prop
 * on the component and falls back to 75 when it is not given. With 95 image
 * usages across 67 files, setting it per call site would mean the default was
 * whatever each new image happened to be written with. So every import of
 * `next/image` goes through here instead, and the number lives in one place.
 *
 * 90 rather than the stock 75 because this site is selling the photographs:
 * flat painted walls, cabinet doors and worktops are exactly the content where
 * 75 shows banding and smearing. `next.config.ts` carries the measurements
 * behind the number, and must keep this value in its `qualities` allowlist or
 * every image 400s.
 *
 * Pass `quality` explicitly to override it for one image.
 */
export const DEFAULT_IMAGE_QUALITY = 90

export default function Image({ quality = DEFAULT_IMAGE_QUALITY, ...props }: ImageProps) {
  return <NextImage quality={quality} {...props} />
}
