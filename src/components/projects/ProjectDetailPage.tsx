import Image from 'next/image'

import { LandscapingCta } from '@/components/blocks/LandscapingCta'
import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Project } from '@/lib/projects'

export function ProjectDetailPage({ project }: { project: Project }) {
  return (
    <div className="min-h-screen bg-paper">
      <section className="relative isolate flex min-h-screen items-end overflow-hidden bg-ink pb-16 pt-36 text-white lg:pb-24">
        <Image
          src={project.heroImage}
          alt={project.title}
          fill
          priority
          className="absolute inset-0 z-0 object-cover"
          sizes="100vw"
        />
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(20,33,61,0.9)_0%,rgba(20,33,61,0.68)_45%,rgba(20,33,61,0.38)_100%),linear-gradient(0deg,rgba(20,33,61,0.8)_0%,transparent_65%)]" />
        <SiteHeader />
        <Container className="relative z-10 w-full">
          <div className="max-w-3xl">
            <p className=" text-xs font-semibold uppercase tracking-[0.2em] text-brass">
              {project.location}
            </p>
            <h1 className=" max-w-2xl font-display text-4xl font-medium leading-tight tracking-tight md:text-7xl">
              {project.title}
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-white/75 md:text-lg">
              {project.summary}
            </p>
          </div>
        </Container>
      </section>

      <Section className="bg-white">
        <div className="mt-8 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass">
              {project.category}
            </p>
            <h2 className="mt-4 font-display text-4xl font-medium text-ink-2">A closer look</h2>
          </div>
          <p className="max-w-3xl text-lg leading-8 text-ink-2/75">{project.description}</p>
        </div>
      </Section>

      {/* Video walkthrough — only rendered when this specific project has
          one attached. Most don't, so this section simply doesn't exist
          in the DOM for them rather than showing an empty placeholder. */}
      {project.video && (
        <Section className="bg-white pt-0">
          <div className="relative aspect-video overflow-hidden bg-ink">
            <video
              controls
              preload="none"
              poster={project.heroImage}
              className="h-full w-full object-cover"
            >
              <source src={project.video.url} type="video/mp4" />
            </video>
          </div>
          {(project.video.title || project.video.projectManager) && (
            <p className="mt-4 text-sm text-ink-2/60">
              {project.video.title}
              {project.video.projectManager &&
                ` — Project manager: ${project.video.projectManager}`}
            </p>
          )}
        </Section>
      )}

      <Section className="bg-white pt-0">
        <div className="grid gap-2 md:grid-cols-2">
          {project.gallery.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="relative aspect-[4/3] overflow-hidden bg-paper-2"
            >
              <Image
                src={image}
                alt={`${project.title} project image ${index + 1}`}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 50vw, 100vw"
              />
            </div>
          ))}
        </div>
      </Section>

      <LandscapingServiceAreas />
      <LandscapingCta />
      <SiteFooter />
    </div>
  )
}
