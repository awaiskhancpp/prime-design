import Image from 'next/image'

import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

type ChecklistItem = { title: string; description: string }

export function ServiceImageChecklistSection({
  eyebrow,
  heading,
  description,
  image,
  imageAlt,
  items,
}: {
  eyebrow?: string
  heading: string
  description?: string
  image: string
  imageAlt: string
  items: ChecklistItem[]
}) {
  return (
    <Section className=" px-0 py-0">
      <div className="grid min-h-[640px] lg:grid-cols-2">
        {/* ── Left: full-bleed image, no frame, no inset ── */}
        <div className="relative min-h-[360px] lg:min-h-full">
          {/*
            `sizes` must describe the source width the CROP needs, not the box
            width. This is a landscape photo (~1.6:1) covering a box that is
            proportionally taller (~688x640 at desktop), so object-cover scales
            by HEIGHT: the pixels needed are height x 1.6 ~= 1030px, not the
            688px the column occupies. Asking for 50vw picked the 750w variant
            and upscaled it ~37%, which is what made this read as a low-quality
            image. The column is capped by the 1440px container, so a fixed
            1200px covers every desktop width without over-fetching. Below lg
            the box is wide and short, the crop is width-driven again, and
            100vw is correct.
          */}
          <Image
            src={image}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 1200px, 100vw"
          />
          {/* Subtle bottom vignette so the image reads into the section below on mobile */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-paper/60 to-transparent lg:hidden"
            aria-hidden
          />
        </div>

        {/* ── Right: heading + numbered list ── */}
        <div className="flex flex-col justify-center px-8 py-16 md:px-14 lg:py-20">
          {/* Header block */}
          <SectionHeader eyebrow={eyebrow} title={heading} description={description} className="max-w-md" />

          {/* Checklist */}
          {items.length ? (
            <ul className="mt-10 space-y-0">
              {items.map(({ title, description: itemDesc }, index) => (
                <li key={title} className="grid grid-cols-[1fr_auto] border-t border-brass/20 py-6">
                  {/* Text column */}
                  <div className="pr-6">
                    <p className="font-display text-lg font-semibold text-ink-2">{title}</p>
                    {itemDesc ? (
                      <p className="mt-1.5 text-sm leading-6 text-ink-2/60">{itemDesc}</p>
                    ) : null}
                  </div>

                  {/* Number column — decorative, recedes into background */}
                  <span
                    className="self-start font-display text-4xl font-semibold leading-none text-brass/20 tabular-nums"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </li>
              ))}
              {/* Closing border under the last item */}
              <li className="border-t border-brass/20" aria-hidden />
            </ul>
          ) : null}
        </div>
      </div>
    </Section>
  )
}
