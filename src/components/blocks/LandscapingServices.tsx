import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

const services = [
  {
    number: '01',
    title: 'Landscape design',
    text: 'A considered plan for planting, paths, lighting, and the way your family will use the outdoors.',
  },
  {
    number: '02',
    title: 'Outdoor living',
    text: 'Beautiful, durable spaces for gathering, dining, relaxing, and making more of the California climate.',
  },
  {
    number: '03',
    title: 'Backyard transformation',
    text: 'From a blank canvas to a complete backyard, we manage the details so the finished space feels effortless.',
  },
]

export function LandscapingServices() {
  return (
    <Section id="process" className="bg-paper">
      <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <SectionHeader eyebrow="What we do" title="A landscape made for living." />
        <p className="max-w-sm text-sm leading-6 text-ink-2/65">
          Simple choices, strong materials, and a process you can understand.
        </p>
      </div>
      <div className="grid gap-px overflow-hidden border border-line bg-line md:grid-cols-3">
        {services.map((service) => (
          <article key={service.number} className="bg-paper p-7 md:p-9">
            <p className="text-sm font-semibold text-brass">{service.number}</p>
            <h3 className="mt-16 text-2xl font-semibold text-ink-2">{service.title}</h3>
            <p className="mt-4 text-sm leading-7 text-ink-2/70">{service.text}</p>
          </article>
        ))}
      </div>
    </Section>
  )
}
