import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { ArrowUpRight } from 'lucide-react'

export function AboutHero() {
  return (
    <PageHero
      align="end"
      eyebrow="About Prime Design & Build"
      title="ABOUT"
      image="/services/home-remodeling.jpeg"
      imageAlt="A finished Prime Design & Build home remodeling project"
    >
        <div className="mt-12 grid max-w-5xl gap-8 border-t border-white/30 pt-8 md:grid-cols-[0.7fr_1.3fr] md:gap-16">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
            About us and our story
          </p>
          <div>
            <p className="max-w-2xl text-xl leading-8 text-white md:text-2xl">
              Our company specializes in creating luxurious and functional interiors and exteriors
              for premium clients.
            </p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 md:text-lg">
              We combine innovative design, high-quality materials, and careful attention to detail
              so every project reflects the people who live there.
            </p>
            <Button href="/contact" variant="line" className="mt-8 text-white">
              Start a conversation <ArrowUpRight />
            </Button>
          </div>
        </div>
    </PageHero>
  )
}
