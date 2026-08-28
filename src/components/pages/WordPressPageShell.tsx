import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import type { WordPressPageDefinition } from '@/lib/wordpressPages'

export function WordPressPageShell({ page }: { page: WordPressPageDefinition }) {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Prime Design & Build"
        title={page.title}
        description={
          page.seoDescription || 'This page is ready for its source content and final redesign.'
        }
        image="/services/home-remodeling.jpeg"
        imageAlt="Prime Design & Build remodeling project"
      />
      <Section>
        <div className="mx-auto max-w-3xl border border-line bg-paper-2 p-8 text-center md:p-12">
          <p className="text-sm uppercase tracking-[0.2em] text-brass-deep">
            WordPress migration page
          </p>
          <h2 className="mt-4 font-display text-3xl font-semibold text-ink">{page.title}</h2>
          <p className="mt-4 text-base leading-8 text-ink-2/70">
            The reusable page shell is in place. Its source-specific content can now be added from
            Payload without changing the shared page structure.
          </p>
        </div>
      </Section>
    </div>
  )
}
