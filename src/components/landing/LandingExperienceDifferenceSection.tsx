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
  const isOdd = items.length % 2 === 1

  return (
    <Section className="bg-white">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-display text-3xl font-medium text-ink md:text-5xl">
          {heading || 'Experience the Prime Difference'}
        </h2>
        {body ? <p className="mt-5 text-base leading-7 text-ink-2/70">{body}</p> : null}
      </div>

      {items.length ? (
        <div className="mx-auto mt-14 max-w-7xl">
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {items.map((item, index) => {
              const isLastOfOdd = isOdd && index === items.length - 1
              return (
                <div
                  key={`${item.title}-${index}`}
                  className={
                    isLastOfOdd
                      ? 'border-t border-brass/30 pt-6 sm:col-span-2 sm:mx-auto sm:w-[calc(50%-1.25rem)]'
                      : 'border-t border-brass/30 pt-6'
                  }
                >
                  <h3 className="font-display text-xl font-medium text-ink">{item.title}</h3>
                  {item.description ? (
                    <p className="mt-2 text-sm leading-6 text-ink-2/70">{item.description}</p>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </Section>
  )
}
