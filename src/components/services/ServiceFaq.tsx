'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { FaqItem } from '@/lib/faq'
import { cn } from '@/lib/utils'

export function ServiceFaq({
  items,
  description,
}: {
  items?: FaqItem[]
  description?: string
}) {
  const shownItems = items ?? []
  const desc = description ?? ''
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!shownItems.length) return null

  return (
    <Section className="bg-white">
      <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
        <div>
          <SectionHeader
            title="Frequently Asked Questions"
            description={desc}
          />
          <Button href="/contact" variant="outline" size="md" className="mt-7">
            Speak with an expert
          </Button>
        </div>
        <div className="border-t border-line">
          {shownItems.map((item, index) => {
            const isOpen = openIndex === index

            return (
              <div key={item.question} className="border-b border-line">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`service-faq-${index}`}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left text-lg font-medium text-ink-2"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                >
                  <span>{item.question}</span>
                  <Plus
                    className={cn(
                      'h-5 w-5 shrink-0 text-brass transition-transform duration-300',
                      isOpen && 'rotate-45',
                    )}
                    aria-hidden
                  />
                </button>
                <div
                  id={`service-faq-${index}`}
                  className={cn(
                    'grid overflow-hidden transition-[grid-template-rows,opacity] duration-500 ease-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="min-h-0">
                    {typeof item.answer === 'string' ? (
                      <p className="max-w-2xl pb-6 pr-10 text-base leading-7 text-ink-2/70">
                        {item.answer}
                      </p>
                    ) : (
                      <div className="max-w-2xl pb-6 pr-10 text-base leading-7 text-ink-2/70">
                        <RichTextContent data={item.answer} />
                      </div>
                    )}
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
