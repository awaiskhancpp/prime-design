import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import type { RichTextValue } from '@/lib/richText'
import type { ServiceDetail } from '@/lib/services'

export type ServiceCraftsmanshipContent = {
  eyebrow: string
  heading: string
  headingAccent: string
  body: string[]
  images: [string, string]
  cta: { label: string; href: string }
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
  return (
    <Section className="">
      <div className="grid items-center gap-14 lg:grid-cols-[0.85fr_1fr] lg:gap-20">
        <div className="relative mb-14 w-full lg:mx-0">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-paper-2 shadow-xl shadow-ink/10">
            <Image
              src={images[0]}
              alt=""
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 45vw, 90vw"
            />
          </div>

          <div className="absolute -bottom-10 left-4 w-2/5 border-5 border-paper bg-paper shadow-2xl shadow-ink/20 sm:-left-3">
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
              <Image
                src={images[1]}
                alt=""
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 18vw, 35vw"
              />
            </div>
          </div>
        </div>

        <div className="pt-14 lg:pt-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrow}
          </p>
          {content ? (
            <RichTextContent data={content} />
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

          <div className="mt-9">
            <Button
              href={cta.href}
              className="border-brass bg-brass text-white hover:border-brass-deep hover:bg-brass-deep"
            >
              {cta.label}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  )
}
