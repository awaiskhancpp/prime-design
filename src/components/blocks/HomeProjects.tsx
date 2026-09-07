import Image from 'next/image'

import website from '../../../website.json'
import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { Button } from '../ui/Button'
import { ArrowRight } from 'lucide-react'

// Placeholder photos cycling across the six project cards — swap each
// entry for the actual project photo once real project photography is
// uploaded to Payload/Media for each `latestProjects` entry.
const projectImages = [
  '/services/kitchen-remodeling.jpeg',
  '/before-after/complete_remodeling_after.jpeg',
  '/services/home-remodeling.jpeg',
  '/before-after/bathroom_remodeling_after.jpeg',
  '/services/kitchen-remodeling.jpeg',
  '/before-after/complete_remodeling_after.jpeg',
]

export function HomeProjects() {
  const { latestProjects } = website

  return (
    <Section className="bg-white">
      <SectionHeader align="center" title="Our latest remodeling projects" />

      <div className="mt-10 grid grid-cols-1 gap-1 overflow-hidden  sm:grid-cols-2 lg:grid-cols-3">
        {latestProjects.map((project, index) => (
          <a
            key={project.slug}
            href={`/project/${project.slug}`}
            className="group relative aspect-[4/3] overflow-hidden bg-ink"
          >
            <Image
              src={projectImages[index % projectImages.length]}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/5 to-transparent" />
            <p className="absolute bottom-4 left-4 right-4 text-sm font-semibold leading-snug text-white md:text-base">
              {project.title}
            </p>
          </a>
        ))}
      </div>
      <div className="flex justify-center">
        <Button href="/our-projects" variant="secondary" className="mt-7">
          See More Projects
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      </div>
    </Section>
  )
}
