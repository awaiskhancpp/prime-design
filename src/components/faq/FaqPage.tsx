import Image from 'next/image'
import Link from 'next/link'
import { ChevronDown } from 'lucide-react'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { Section } from '@/components/ui/Section'
import { faqCategories } from '@/lib/faq'

export function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader tone="light" />

      <main className="pt-20 md:pt-28">
        <section className="border-b border-line bg-paper">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-14 md:py-16 lg:px-12">
            <div className="relative aspect-[4/3] overflow-hidden bg-paper-2 md:order-2">
              <Image src="/services/kitchen-remodeling.jpeg" alt="Bright remodeled kitchen" fill priority className="object-cover" sizes="(min-width: 768px) 60vw, 100vw" />
              <div className="absolute inset-0 bg-ink/10" />
            </div>
            <div className="md:order-1">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">Frequently asked questions</p>
              <h1 className="mt-4 max-w-xl font-display text-4xl font-medium leading-tight tracking-tight text-ink md:text-6xl">Explore the FAQs: Your Comprehensive Guide to Home Remodeling</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-ink-2/70">Find helpful answers about our design process, remodeling services, timelines, materials, and more.</p>
              <Link href="#faq-list" className="mt-7 inline-flex text-sm font-semibold text-brass-deep hover:text-brass">Browse questions ↓</Link>
            </div>
          </div>
        </section>

        <Section id="faq-list" className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:gap-14">
              {faqCategories.map((category) => (
                <section key={category.title}>
                  <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">{category.title}</h2>
                  <div className="mt-3 h-px w-20 bg-brass" />
                  <div className="mt-2 divide-y divide-line">
                    {category.items.map((item) => (
                      <details key={item.question} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium text-ink-2 marker:hidden [&::-webkit-details-marker]:hidden">
                          <span>{item.question}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 text-ink-2/60 transition-transform duration-200 group-open:rotate-180" aria-hidden />
                        </summary>
                        <p className="max-w-3xl pb-5 pr-10 text-sm leading-7 text-ink-2/70">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Section>
      </main>

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
