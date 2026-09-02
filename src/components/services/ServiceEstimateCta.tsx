import Link from 'next/link'
import { Container } from '../ui/Container'
import { ArrowRight } from 'lucide-react'

export function ServiceEstimateCta() {
  return (
    <section className="bg-brass">
      <Container>
        <div className=" flex flex-wrap items-center justify-between gap-5 py-9">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white">
              Ready to schedule your free estimate?
            </h2>
            <p className="mt-2 text-sm text-white/85 ">
              Contact us here or reach us at{' '}
              <a href="tel:6502354863" className="underline">
                (650) 235-4863
              </a>{' '}
            </p>
          </div>
          <Link
            href="/contact"
            className="bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-paper items-center flex gap-2"
          >
            Get started <ArrowRight />
          </Link>
        </div>
      </Container>
    </section>
  )
}
