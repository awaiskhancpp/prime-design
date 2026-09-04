import { Section } from '@/components/ui/Section'

type Feature = { title?: string; description?: string }

export function LandingExperienceDifferenceSection({
  eyebrow = 'Experience the difference',
  heading,
  body,
  features = [],
}: {
  eyebrow?: string
  heading?: string
  body?: string
  features?: Feature[]
}) {
  const items = features.filter((item) => item.title)

  return (
    <Section className="bg-ink-2 text-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">{eyebrow}</p>
        <h2 className="mt-4 font-display text-3xl font-medium md:text-5xl">
          {heading || 'Experience the Prime Difference'}
        </h2>
        {body ? <p className="mt-5 text-base leading-7 text-white/75">{body}</p> : null}
      </div>

      {items.length ? (
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <div
              key={`${item.title}-${index}`}
              className="group relative border border-white/10 bg-white/[0.03] p-6 transition-colors duration-300 hover:border-brass/40"
            >
              <span
                className="absolute left-0 top-0 h-0.5 w-0 bg-brass transition-all duration-300 ease-out group-hover:w-full"
                aria-hidden
              />
              <h3 className="font-display text-xl font-medium text-white">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 text-sm leading-6 text-white/70">{item.description}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </Section>
  )
}
