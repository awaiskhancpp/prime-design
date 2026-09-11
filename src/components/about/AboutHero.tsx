import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { ArrowUpRight } from 'lucide-react'

export function AboutHero() {
  return (
    <PageHero
      align="left"
      eyebrow="About us and our story"
      title="The Go-To Choice for Homeowners In Silicon Valley"
      description="Our team of visionary leaders and dedicated professionals are committed to transforming your dreams into reality. With years of experience and a shared passion for excellence, we are here to deliver unparalleled service and create stunning spaces that exceed your expectations."
      image="/services/home-remodeling.jpeg"
      imageAlt="A finished Prime Design & Build home remodeling project"
    >
      <div className=" ">
        <Button href="/contact" variant="outline" className="mt-8 text-white">
          Unlock Your Dream Home Today
        </Button>
      </div>
    </PageHero>
  )
}
