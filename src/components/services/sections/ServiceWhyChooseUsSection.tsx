export const homeRepairWhyChooseContent = {
  heading: 'Why Choose Prime Design & Build?',
  items: [
    { title: 'Over 350+ Projects', description: 'in Silicon Valley' },
    { title: 'Experts on-site', description: 'for interior design & planning' },
    { title: 'Certified General Contractor', description: 'fully licensed' },
    { title: 'Family-owned and operated', description: 'for personalized service' },
    { title: 'Competitive pricing', description: 'without compromising quality' },
    { title: 'Quick response', description: 'and customer satisfaction guaranteed' },
  ],
}

export function ServiceWhyChooseUsSection({
  heading = homeRepairWhyChooseContent.heading,
  items = homeRepairWhyChooseContent.items,
}: {
  heading?: string
  items?: typeof homeRepairWhyChooseContent.items
}) {
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
                <p className="mt-0.5 text-sm text-ink/65">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
