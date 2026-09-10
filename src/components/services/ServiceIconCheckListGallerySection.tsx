import Image from 'next/image'
import { Clock, Heart, KeyRound, Ruler, Sparkles, type LucideIcon } from 'lucide-react'

type ChecklistItem = {
  /** Icon name from the WordPress source (themify), mapped to a Lucide icon. */
  icon: string
  title: string
  description: string
}

/**
 * WordPress themify icon names → Lucide equivalents. Unknown names fall
 * back to a neutral sparkle so a migrated icon never blanks the card.
 */
const iconMap: Record<string, LucideIcon> = {
  'ti-ruler-pencil': Ruler,
  'ti-heart': Heart,
  'ti-key': KeyRound,
  'ti-time': Clock,
}

/**
 * Adaptive gallery grid — handles 1-4+ images without assuming an exact
 * count, since real per-page content won't always have exactly 4 photos.
 * 1 image: single frame. 2: side-by-side. 3: one large + two stacked.
 * 4+: even 2x2 grid (only the first 4 are shown).
 */
function ImageGrid({ images, alt }: { images: string[]; alt: string }) {
  const shown = images.slice(0, 4)

  if (shown.length === 0) return null

  if (shown.length === 1) {
    return (
      <div className="relative aspect-[4/5] overflow-hidden">
        <Image
          src={shown[0]}
          alt={alt}
          fill
          className="object-cover"
          sizes="(min-width: 768px) 45vw, 100vw"
        />
      </div>
    )
  }

  if (shown.length === 2) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {shown.map((src, index) => (
          <div key={src} className="relative aspect-[3/4] overflow-hidden">
            <Image
              src={src}
              alt={`${alt} ${index + 1}`}
              fill
              className="object-cover"
              sizes="22vw"
            />
          </div>
        ))}
      </div>
    )
  }

  if (shown.length === 3) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="relative row-span-2 aspect-[3/5] overflow-hidden">
          <Image src={shown[0]} alt={`${alt} 1`} fill className="object-cover" sizes="22vw" />
        </div>
        {shown.slice(1).map((src, index) => (
          <div key={src} className="relative aspect-[4/3] overflow-hidden">
            <Image
              src={src}
              alt={`${alt} ${index + 2}`}
              fill
              className="object-cover"
              sizes="22vw"
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {shown.map((src, index) => (
        <div key={src} className="relative aspect-square overflow-hidden">
          <Image src={src} alt={`${alt} ${index + 1}`} fill className="object-cover" sizes="22vw" />
        </div>
      ))}
    </div>
  )
}

export function ServiceIconChecklistGallerySection({
  eyebrow,
  heading,
  items,
  images,
  imageAlt,
}: {
  eyebrow?: string
  heading: string
  items: ChecklistItem[]
  images: string[]
  imageAlt: string
}) {
  return (
    <section className=" py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 md:grid-cols-2 md:items-center md:gap-16">
        <div>
          {eyebrow ? <p className="font-display text-lg italic text-ink-2/80">{eyebrow}</p> : null}
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
            {heading}
          </h2>

          <ul className="mt-9 grid gap-7">
            {items.map(({ icon, title, description }) => {
              const Icon = iconMap[icon] ?? Sparkles
              return (
                <li key={title} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brass/40 text-brass-deep">
                    <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
                  </span>
                  <div>
                    <p className="font-display text-lg font-medium text-ink">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-2/70">{description}</p>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Offset brass frame behind the whole gallery — same motif used
            elsewhere on the site (intro/contact sections) — instead of the
            hard navy/brass color-block split this replaces. */}
        <div className="relative">
          <div
            className="absolute inset-0 translate-x-4 translate-y-4 border border-brass"
            aria-hidden
          />
          <div className="relative">
            <ImageGrid images={images} alt={imageAlt} />
          </div>
        </div>
      </div>
    </section>
  )
}
