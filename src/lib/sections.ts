import type { RichTextValue } from '@/lib/richText'

/**
 * The generic "Custom section" block (see `collections/blocks/SharedBlocks`).
 * Both blocks-based pages (homepage, About) render it through the same
 * component, so the shape and its mapping live here.
 */
export type CustomSectionContent = {
  eyebrow?: string
  heading: string
  headingHighlight?: string
  body?: RichTextValue
  image?: string
  imageSide: 'left' | 'right'
  buttons: Array<{ label: string; href: string }>
}

type CustomSectionBlock = {
  eyebrow?: string | null
  heading?: string | null
  headingHighlight?: string | null
  body?: RichTextValue | null
  image?: unknown
  imageSide?: 'left' | 'right' | null
  buttons?: Array<{ label?: string | null; href?: string | null }> | null
}

const textOr = (value: string | null | undefined) =>
  typeof value === 'string' && value.trim() ? value : undefined

/** Maps a stored `custom` block onto the render shape. */
export function resolveCustomSection(
  block: CustomSectionBlock,
  mediaUrl: (value: unknown) => string | undefined,
): CustomSectionContent {
  return {
    eyebrow: textOr(block.eyebrow),
    heading: textOr(block.heading) || '',
    headingHighlight: textOr(block.headingHighlight),
    body: block.body ?? undefined,
    image: mediaUrl(block.image),
    imageSide: block.imageSide === 'left' ? 'left' : 'right',
    buttons:
      block.buttons
        ?.filter((button) => textOr(button.label) && textOr(button.href))
        .map((button) => ({ label: button.label as string, href: button.href as string })) ?? [],
  }
}
