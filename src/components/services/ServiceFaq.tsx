'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { faqCategories, type FaqItem } from '@/lib/faq'
import { cn } from '@/lib/utils'

type ServiceFaqContent = {
  description: string
  items: FaqItem[]
}

function itemsFrom(title: string) {
  return faqCategories.find((category) => category.title === title)?.items ?? []
}

const faqsBySlug: Record<string, ServiceFaqContent> = {
  'kitchen-remodeling': {
    description:
      'Do you have a kitchen project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    items: itemsFrom('Kitchen Remodel Questions'),
  },
  'custom-kitchen-silicon-valley': {
    description:
      'Planning a custom kitchen? Bring a clear idea or a rough sketch—we’ll sit down with you at the studio or at your house and map the project from there.',
    items: itemsFrom('Custom Kitchen Questions'),
  },
  'european-kitchen-silicon-valley': {
    description:
      'Curious about a European kitchen? Start with a conversation. We’ll walk through how the style can work in your home and what the remodel involves.',
    items: itemsFrom('European Kitchen Questions'),
  },
  'shaker-kitchen-silicon-valley': {
    description:
      'Considering a Shaker kitchen? We’ll help you decide how traditional or contemporary the look should be, then plan the remodel around that choice.',
    items: itemsFrom('Shaker Kitchen Questions'),
  },
  'bathroom-remodeling': {
    description:
      'Do you have a bathroom project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    items: itemsFrom('Bathroom Remodel Questions'),
  },
  'home-remodeling': {
    description:
      'Do you have a home remodeling project? Whether it’s a detailed vision or just some vague ideas, your design starts with an appointment in our store or at your house with our project manager who can assist you throughout your project.',
    items: itemsFrom('Home Remodel Questions'),
  },
  'complete-renovation': {
    description:
      'Thinking about a complete renovation? We’ll start with a conversation about how you live now and what you want the house to become.',
    items: itemsFrom('Complete Renovations Questions'),
  },
  adu: {
    description:
      'Considering an ADU? We’ll review your property, local rules, and how you want to use the new space before any design work begins.',
    items: itemsFrom('ADU Questions'),
  },
  additions: {
    description:
      'Planning a room addition? We’ll look at how the new space should connect to your home, then help you think through layout, budget, and next steps.',
    items: itemsFrom('Room Additions Questions'),
  },
  finance: {
    description:
      'Need help funding a remodel? Here are the questions homeowners ask most often about paying for the work.',
    items: itemsFrom('Finance Questions'),
  },
}

export function getServiceFaq(slug: string) {
  return faqsBySlug[slug]
}

export function ServiceFaq({
  slug,
  items,
  description,
}: {
  slug: string
  items?: FaqItem[]
  description?: string
}) {
  const faq = getServiceFaq(slug)
  const shownItems = items ?? faq?.items ?? []
  const desc = description ?? faq?.description
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
