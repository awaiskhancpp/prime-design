import Link from 'next/link'
import { Container } from '../ui/Container'
import { ArrowRight } from 'lucide-react'

export function ServiceEstimateCta({
  heading,
  description,
}: {
  heading?: string
  description?: string
}) {
  return (
    <section className="bg-brass">
      <Container>
        <div className=" flex flex-wrap items-center justify-between gap-5 py-9">
          <div>
            <h2 className="font-display text-3xl font-semibold text-white">{heading}</h2>
            {description ? <p className="mt-2 text-sm text-white/85 ">{description}</p> : null}
          </div>
          {/* <Link
            href="/contact"
            className="bg-white px-5 py-3 text-sm font-semibold text-ink hover:bg-paper items-center flex gap-2"
          >
            Get started <ArrowRight />
          </Link> */}
        </div>
      </Container>
    </section>
  )
}
