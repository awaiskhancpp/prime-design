import Image from '@/components/ui/Image'

import { Container } from '@/components/ui/Container'

/**
 * Every field is optional and nothing is substituted for a missing one.
 *
 * The callers used to pass literals when the CMS was empty — "Crafting your
 * dream home, our promise", "Prime Design & Build" — so a page with a broken
 * or unmigrated quote record still showed a confident-looking pull-quote that
 * no editor had written and no editor could change. An empty field now leaves
 * its line out, which makes the gap visible rather than papering over it.
 */
export type ServiceQuoteContent = {
  heading?: string
  quote?: string
  attribution?: string
  image?: string
}

export function ServiceQuoteSection({ heading, quote, attribution, image }: ServiceQuoteContent) {
  // With no quote and no heading there is no section — just a dark band.
  if (!quote && !heading) return null

  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-white md:py-28">
      {image ? <Image src={image} alt="" fill className="object-cover" sizes="100vw" /> : null}
      <div className="absolute inset-0 bg-ink/75" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-6xl leading-none text-brass" aria-hidden>
            “
          </p>
          {heading ? (
            <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">
              {heading}
            </h2>
          ) : null}
          {quote ? (
            <p className="mt-8 font-display text-lg leading-8 text-white/85 md:text-xl">{quote}</p>
          ) : null}
          {attribution ? <p className="mt-8 text-sm italic text-brass">— {attribution}</p> : null}
        </div>
      </Container>
    </section>
  )
}
