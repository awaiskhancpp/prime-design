export function ServiceWhyChooseUsSection({
  heading = '',
  items = [],
}: {
  heading?: string
  items?: Array<{ title: string; description?: string }>
}) {
  // Content comes from Payload only — render nothing without items.
  if (!items.length) return null
  return (
    <section className="py-16 text-ink md:py-20">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center font-display text-3xl font-medium tracking-tight md:text-4xl">
          {heading}
        </h2>

        <div className="mt-12 grid gap-x-16 gap-y-8 sm:grid-cols-2">
          {items.map((item, index) => (
            <div key={item.title} className="flex items-center gap-4 border-t border-ink/10 pt-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-brass text-sm font-semibold text-brass">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div>
                <p className="font-semibold text-ink">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-sm text-ink/65">{item.description}</p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
