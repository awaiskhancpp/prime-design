import { ChevronDown } from 'lucide-react'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { PageHero } from '@/components/layout/PageHero'
import { Section } from '@/components/ui/Section'
import { faqCategories } from '@/lib/faq'

export function FaqPage() {
  return (
    <div className="min-h-screen bg-white">
      <PageHero
        eyebrow="Frequently asked questions"
        title="Explore the FAQs: Your Comprehensive Guide to Home Remodeling"
        description="Find helpful answers about our design process, remodeling services, timelines, materials, and more."
        image="/services/kitchen-remodeling.jpeg"
        imageAlt="Bright remodeled kitchen"
        cta={{ label: 'Browse questions', href: '#faq-list' }}
      />

      <main>
        <Section id="faq-list" className="bg-white py-12 md:py-20">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-12 md:gap-14">
              {faqCategories.map((category) => (
                <section key={category.title}>
                  <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">
                    {category.title}
                  </h2>
                  <div className="mt-3 h-px w-20 bg-brass" />
                  <div className="mt-2 divide-y divide-line">
                    {category.items.map((item, index) => (
                      <details key={item.question} className="group">
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-medium text-ink-2 marker:hidden [&::-webkit-details-marker]:hidden">
                          <span>{item.question}</span>
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-ink-2/60 transition-transform duration-200 group-open:rotate-180"
                            aria-hidden
                          />
                        </summary>
                        <p className="max-w-3xl pb-5 pr-10 text-sm leading-7 text-ink-2/70">
                          {item.answer}
                        </p>
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
