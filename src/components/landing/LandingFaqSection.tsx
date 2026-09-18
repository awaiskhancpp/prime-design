'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Section } from '@/components/ui/Section'

type FaqItem = { question: string; answer: string }
type FaqCategory = { title: string; items: FaqItem[] }

export function LandingFaqSection({
  heading,
  description,
  items = [],
  categories = [],
}: {
  heading?: string
  description?: string
  items?: FaqItem[]
  categories?: FaqCategory[]
}) {
  // Initialize with 0 instead of null so the first question renders open.
  const [open, setOpen] = useState<number | null>(0)
  const [activeCategory, setActiveCategory] = useState(0)
  const visibleItems = categories.length ? categories[activeCategory]?.items || [] : items
  if (!visibleItems.length) return null
  return (
    <Section className="bg-white">
      {heading ? (
        <h2 className="font-display text-3xl font-medium text-ink md:text-4xl">{heading}</h2>
      ) : null}
      {description ? (
        <p className="mt-4 max-w-3xl text-base leading-7 text-ink-2/70">{description}</p>
      ) : null}
      {categories.length ? (
        <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
          {categories.map((category, index) => (
            <button
              key={category.title}
              type="button"
              onClick={() => {
                setActiveCategory(index)
                setOpen(null)
              }}
              className={`px-4 py-2 text-sm ${activeCategory === index ? 'bg-brass text-white' : 'border border-line text-ink-2'}`}
            >
              {category.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-8 border-t border-line">
        {visibleItems.map((item, index) => (
          <div key={item.question} className="border-b border-line">
            <button
              type="button"
              aria-expanded={open === index}
              onClick={() => setOpen(open === index ? null : index)}
              className="flex w-full items-center justify-between gap-6 py-5 text-left text-lg font-medium text-ink-2"
            >
              {item.question}
              <Plus
                className={`h-5 w-5 shrink-0 text-brass transition-transform ${open === index ? 'rotate-45' : ''}`}
                aria-hidden
              />
            </button>
            {open === index ? (
              <p className="max-w-3xl pb-5 pr-8 text-base leading-7 text-ink-2/70">{item.answer}</p>
            ) : null}
          </div>
        ))}
      </div>
    </Section>
  )
}
