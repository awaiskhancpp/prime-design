import Link from 'next/link'

export function ServiceEstimateCta() {
  return (
    <section className="bg-brass">
      <div className=" flex flex-wrap items-center justify-between gap-5 px-5 py-9 sm:px-8 lg:px-12">
        <div>
          <h2 className="font-display text-3xl font-semibold text-white">
            Ready to schedule your free estimate?
          </h2>
          <p className="mt-2 text-sm text-white/85">
            Contact us here or reach us at{' '}
            <a href="tel:6502354863" className="underline">
              (650) 235-4863
            </a>{' '}
            →
          </p>
        </div>
        <Link
          href="/contact"
          className="bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-paper"
        >
          Get started
        </Link>
      </div>
    </section>
  )
}
