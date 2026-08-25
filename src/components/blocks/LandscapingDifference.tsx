import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

const principles = [
  'One team from first sketch to final detail',
  'Design decisions grounded in how you live',
  'Licensed, experienced, and transparent',
  'Materials selected for beauty and longevity',
]

export function LandscapingDifference() {
  return (
    <Section className="bg-paper-2">
      <div className="grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-24">
        <div className="relative min-h-96 overflow-hidden bg-ink">
          <div className="absolute inset-8 border border-brass/60" />
          <div className="absolute bottom-8 left-8 max-w-xs text-white">
            <p className="text-xs uppercase tracking-[0.2em] text-brass">Design / Build / Enjoy</p>
            <p className="mt-3 font-display text-3xl font-medium leading-tight">
              The best details are the ones you use every day.
            </p>
          </div>
        </div>
        <div>
          <SectionHeader eyebrow="The Prime difference" title="Thoughtful from the ground up." />
          <div className="mt-8 grid gap-4">
            {principles.map((point) => (
              <div key={point} className="flex gap-3 border-t border-line pt-4 text-sm text-ink-2/75">
                <span className="text-brass" aria-hidden>✦</span>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  )
}
