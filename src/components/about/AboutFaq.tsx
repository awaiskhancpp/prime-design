'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import website from '../../../website.json'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

export function AboutFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const { faq } = website.about

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <div>
          <SectionHeader eyebrow={faq.eyebrow} title={faq.heading} description={faq.description} />
          <Button
            href={`tel:${website.header.phoneOffice.replace(/[^\d+]/g, '')}`}
            variant="outline"
            size="md"
            className="mt-7"
          >
            Give us a ring at {website.header.phoneOffice}
          </Button>
        </div>
        <div className="border-t border-line">
          {faq.items.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div key={item.question} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-lg font-medium text-ink-2"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <Plus className={cn('h-5 w-5 shrink-0 text-brass transition-transform duration-300', isOpen && 'rotate-45')} aria-hidden />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="min-h-0">
                    <p className="max-w-2xl pb-6 pr-10 text-base leading-7 text-ink-2/70">{item.answer}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Section>
  )
}
