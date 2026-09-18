import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import type { RichTextValue } from '@/lib/richText'

export type ServiceCraftsmanshipContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  body: string[]
  /** The section's photos — the design renders with one or two; none is fine. */
  images?: string[]
  /** Button under the copy; no button renders when this is absent. */
  cta?: { label?: string; href?: string }
}

export function ServiceCraftsmanshipTransformsSection({
  eyebrow,
  heading,
  headingAccent,
  body,
  images,
  cta,
  content,
}: ServiceCraftsmanshipContent & { content?: RichTextValue }) {
  // The WordPress section carries a small line ("We make it easy") between
  // its heading and body. On this design it is the eyebrow above the
  // heading, so lift that h3 out of the rich text and render it there —
  // the paragraphs keep flowing underneath the heading.
  let eyebrowText = eyebrow
  let contentToRender = content
  const root = (content as { root?: { children?: unknown[] } } | undefined)?.root
  if (root && Array.isArray(root.children)) {
    const children = [...root.children]
    const h3Index = children.findIndex((child) => {
      const node = child as { type?: string; tag?: string; children?: Array<{ text?: string }> }
      return node?.type === 'heading' && node?.tag === 'h3'
    })
    if (h3Index >= 0) {
      const node = children[h3Index] as { children?: Array<{ text?: string }> }
      const text = (node.children ?? [])
        .map((child) => child.text ?? '')
        .join('')
        .trim()
      if (text) {
        eyebrowText = text
        children.splice(h3Index, 1)
        contentToRender = { ...(content as object), root: { ...root, children } } as RichTextValue
      }
    }
  }

  // Photos come from Payload only — no stand-in image is substituted.
  const photos = (images ?? []).filter(Boolean)

  return (
    <Section className="">
      <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
        {photos.length ? (
          <div className="relative mb-14 w-full lg:mx-0">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-2 shadow-xl shadow-ink/10">
              <Image
                src={photos[0]}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 45vw, 90vw"
              />
            </div>

            {photos[1] ? (
              <div className="absolute -bottom-10 left-4 w-2/5 border-5 border-paper bg-paper shadow-2xl shadow-ink/20 sm:-left-3">
                <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
                  <Image
                    src={photos[1]}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(min-width: 1024px) 18vw, 35vw"
                  />
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="pt-14 lg:pt-0">
          {eyebrowText ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
              {eyebrowText}
            </p>
          ) : null}
          {contentToRender ? (
            <RichTextContent data={contentToRender} />
          ) : (
            <>
              <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-5xl">
                {heading}{' '}
                <span className="bg-gradient-to-r from-brass to-brass-deep bg-clip-text text-transparent">
                  {headingAccent}
                </span>
              </h2>

              <div className="mt-6 grid gap-4">
                {body.map((paragraph) => (
                  <p key={paragraph} className="text-base leading-7 text-ink-2/70">
                    {paragraph}
                  </p>
                ))}
              </div>
            </>
          )}

          {cta?.label && cta?.href ? (
            <div className="mt-9">
              <Button
                href={cta.href}
                className="border-brass bg-brass text-white hover:border-brass-deep hover:bg-brass-deep"
              >
                {cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
