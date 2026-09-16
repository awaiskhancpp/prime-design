import Image from 'next/image'
import { Clock, Heart, KeyRound, Ruler, Sparkles, type LucideIcon } from 'lucide-react'
import { Container } from '../ui/Container'

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
 * Adaptive gallery — handles 1-4+ images without assuming an exact count,
 * since real per-page content won't always have exactly 4 photos.
 * 1: single frame. 2: side-by-side. 3: one tall + two stacked.
 * 4+: two columns with the right column dropped, echoing the staggered
 * collage of the WordPress source rather than a flat, static 2x2.
 *
 * Keys are composite (`src` + index) because migrated galleries in this
 * project genuinely repeat the same file, which would collide on `src`
 * alone and drop images from the render.
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
      <div className="grid grid-cols-2 gap-4">
        {shown.map((src, index) => (
          <div
            key={`${src}-${index}`}
            className={`relative aspect-[3/4] overflow-hidden ${index === 1 ? 'mt-8' : ''}`}
          >
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
      <div className="grid grid-cols-2 gap-4">
        <div className="relative row-span-2 aspect-[3/5] overflow-hidden">
          <Image src={shown[0]} alt={`${alt} 1`} fill className="object-cover" sizes="22vw" />
        </div>
        {shown.slice(1).map((src, index) => (
          <div key={`${src}-${index}`} className="relative aspect-[4/3] overflow-hidden">
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

  // 4+: staggered two-column collage. The right column is offset downward
  // and the aspect ratios alternate, so the block reads as a composition
  // rather than a uniform grid of square crops.
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="grid gap-4">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={shown[0]} alt={`${alt} 1`} fill className="object-cover" sizes="22vw" />
        </div>
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image src={shown[2]} alt={`${alt} 3`} fill className="object-cover" sizes="22vw" />
        </div>
      </div>
      <div className="grid gap-4 md:mt-10">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image src={shown[1]} alt={`${alt} 2`} fill className="object-cover" sizes="22vw" />
        </div>
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image src={shown[3]} alt={`${alt} 4`} fill className="object-cover" sizes="22vw" />
        </div>
      </div>
    </div>
  )
}

/**
 * Icon checklist + photo collage. Image sits on the RIGHT here,
 * deliberately mirroring ServiceImageChecklistSection (image left), so
 * consecutive sections alternate instead of stacking the same shape twice.
 */
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
      <Container>
        <div className="grid gap-14 md:grid-cols-[1.05fr_0.95fr] md:items-start md:gap-16">
          <div>
            {eyebrow ? (
              <p className="font-display text-lg italic text-ink-2/80">{eyebrow}</p>
            ) : null}
            <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-4xl">
              {heading}
            </h2>
            {/* Short brass rule — same header anchor used by the sibling
                section, so the pair reads as one family. */}
            <span className="mt-7 block h-px w-16 bg-brass" aria-hidden />

            <ul className="mt-9 grid">
              {items.map(({ icon, title, description }, index) => {
                const Icon = iconMap[icon] ?? Sparkles
                return (
                  <li
                    key={title}
                    className={`group flex gap-4 py-5 ${
                      index === 0 ? 'pt-0' : 'border-t border-line'
                    }`}
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brass/40 text-brass-deep transition-colors duration-300 group-hover:border-brass group-hover:bg-brass group-hover:text-white">
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

          <ImageGrid images={images} alt={imageAlt} />
        </div>
      </Container>
    </section>
  )
}
