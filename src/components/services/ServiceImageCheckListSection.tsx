import Image from 'next/image'
import { Check } from 'lucide-react'

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
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        {eyebrow ? (
          <p className="font-display text-lg italic text-ink-2/80">{eyebrow}</p>
        ) : null}
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
          {heading}
        </h2>
        {description ? (
          <p className="mt-4 text-base leading-7 text-ink-2/70">{description}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-12 px-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-16">
        {/* Offset brass frame — same motif used elsewhere on the site —
            replacing the one-off dark shadow-box this had before. */}
        <div className="relative">
          <div
            className="absolute inset-0 -translate-x-3 -translate-y-3 border border-brass"
            aria-hidden
          />
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={image}
              alt={imageAlt}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 40vw, 100vw"
            />
          </div>
        </div>

        <ul className="grid gap-6">
          {items.map(({ title, description }) => (
            <li key={title}>
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ink text-ink">
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                </span>
                <p className="font-display text-lg font-semibold text-ink">{title}</p>
                <span className="h-px flex-1 bg-brass/60" aria-hidden />
              </div>
              <p className="mt-2 pl-10 text-sm leading-6 text-ink-2/70">{description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
