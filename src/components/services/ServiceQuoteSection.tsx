import Image from 'next/image'

import { Container } from '@/components/ui/Container'

export type ServiceQuoteContent = {
  heading: string
  quote: string
  attribution: string
  image: string
}

export function ServiceQuoteSection({ heading, quote, attribution, image }: ServiceQuoteContent) {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-white md:py-28">
      <Image
        src={image}
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-ink/75" />

      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-display text-6xl leading-none text-brass" aria-hidden>
            “
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight tracking-tight md:text-5xl">
            {heading}
          </h2>
          <p className="mt-8 font-display text-lg leading-8 text-white/85 md:text-xl">{quote}</p>
          <p className="mt-8 text-sm italic text-brass">— {attribution}</p>
        </div>
      </Container>
    </section>
  )
}
