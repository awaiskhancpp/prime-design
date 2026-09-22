import Image from '@/components/ui/Image'
import Link from 'next/link'
import { Section } from '@/components/ui/Section'

type ServiceCard = { title: string; description?: string; image?: string; link?: string }

/**
 * LandingServicesSection
 *
 * The services grid on the Google Ads landing pages — the WordPress
 * `sub-services` section ("We always provide the best service" / "Services" /
 * "Need a new kitchen, bathroom, or complete home renovation?" over six
 * service cards). It was previously called `LandingProjectsSection`, which
 * read as though it rendered the projects grid; the projects grid is
 * `LandingProjectGridSection`, a different section.
 *
 * Every string comes from the caller. There are no default headings: a
 * section that supplies its own copy when the CMS field is empty makes it
 * impossible to tell whether the content is actually wired to Payload.
 */
export function LandingServicesSection({
  eyebrow,
  heading,
  description,
  items,
}: {
  eyebrow?: string
  heading?: string
  description?: string
  items: ServiceCard[]
}) {
  if (!items.length) return null
  return (
    <Section className="bg-white" id="services">
      <div className="grid gap-8 md:grid-cols-[1fr_0.8fr]">
        <div>
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
          ) : null}
          {heading ? (
            <h2 className="mt-3 font-display text-3xl font-medium text-ink md:text-5xl">
              {heading}
            </h2>
          ) : null}
        </div>
        {description ? <p className="text-base leading-7 text-ink-2/70">{description}</p> : null}
      </div>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="border border-line bg-paper-2">
            {item.image ? (
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized={
                    item.image.startsWith('http') || item.image.includes('/api/media/file/')
                  }
                />
              </div>
            ) : null}
            <div className="p-5">
              <h3 className="font-display text-xl text-ink">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 text-sm leading-6 text-ink-2/70">{item.description}</p>
              ) : null}
              {/* {item.link ? (
                <Link
                  href={item.link}
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.15em] text-brass-deep"
                >
                  View project →
                </Link>
              ) : null} */}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
