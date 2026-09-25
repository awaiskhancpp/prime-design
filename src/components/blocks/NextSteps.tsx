import { Container } from '@/components/ui/Container'
import type { PageNextStepsContent } from '@/lib/pageSections'

/**
 * "What happens next" — a short numbered list under a heading.
 *
 * The numbers are the array order, printed as 01, 02, 03.
 */
export function NextSteps({ content }: { content: PageNextStepsContent }) {
  if (!content.steps.length) return null

  return (
    <section className="border-t border-line py-16 md:py-20">
      <Container>
        {content.heading ? (
          <h2 className="font-display text-2xl font-medium text-ink-2 md:text-3xl">
            {content.heading}
          </h2>
        ) : null}

        <ol className="mt-10 grid gap-8 sm:grid-cols-3">
          {content.steps.map((step, index) => (
            <li key={step.title} className="border-t border-line pt-6">
              <span className="font-display text-sm font-semibold text-brass">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-3 font-display text-lg font-medium text-ink-2">{step.title}</h3>
              {step.detail ? (
                <p className="mt-2 text-sm leading-6 text-ink-2/70">{step.detail}</p>
              ) : null}
            </li>
          ))}
        </ol>
      </Container>
    </section>
  )
}
