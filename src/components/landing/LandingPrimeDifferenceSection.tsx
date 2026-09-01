import { Section } from '@/components/ui/Section'

export function LandingPrimeDifferenceSection({
  heading,
  body,
  checklist,
  videoUrl,
  poster,
}: {
  heading?: string
  body?: string
  checklist?: string[]
  videoUrl?: string
  poster?: string
}) {
  return (
    <Section className="bg-ink-2 text-white">
      <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
            The Prime Difference
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium md:text-5xl">
            {heading || 'Craftsmanship that transforms your home'}
          </h2>
          {body ? <p className="mt-5 text-base leading-7 text-white/75">{body}</p> : null}
          {checklist?.length ? (
            <ul className="mt-6 grid gap-3 text-sm text-white/80">
              {checklist.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : null}
        </div>
        {videoUrl ? (
          <video className="aspect-video w-full object-cover" controls playsInline poster={poster}>
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : null}
      </div>
    </Section>
  )
}
