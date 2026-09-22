import Image from '@/components/ui/Image'
import { VideoPlayer } from '@/components/ui/VideoPlayer'

import { LandscapingServiceAreas } from '@/components/blocks/LandscapingServiceAreas'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { Container } from '@/components/ui/Container'
import { Section } from '@/components/ui/Section'
import type { Project } from '@/lib/projects'
import { ProjectGallery } from './ProjectGallery'
import { ProjectLocationMap } from './ProjectLocationMap'

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

      {/* Walkthrough and location. Both are optional and independent: some
          projects have a video, more have a map, one has neither. When both
          exist they share a row, with the video taking the larger share;
          alone, each takes the full width. A project with neither has no
          section in the DOM at all rather than an empty placeholder. */}
      {(project.video || project.map) && (
        <Section className="bg-white pt-0">
          <div
            className={
              project.video && project.map
                ? 'grid gap-6 lg:grid-cols-[1.55fr_1fr] lg:gap-8'
                : ''
            }
          >
            {project.video ? (
              <div className="min-w-0">
                <div className="relative aspect-video overflow-hidden bg-ink">
                  <VideoPlayer
                    src={project.video.url}
                    poster={project.heroImage}
                    label={project.video.title || 'project video'}
                    className="h-full w-full"
                  />
                </div>
                {(project.video.title || project.video.projectManager) && (
                  <p className="mt-4 text-sm text-ink-2/60">
                    {project.video.title}
                    {project.video.projectManager}
                  </p>
                )}
              </div>
            ) : null}

            {project.map ? (
              <ProjectLocationMap
                map={project.map}
                title={project.title}
                variant={project.video ? 'panel' : 'wide'}
              />
            ) : null}
          </div>

          {/* What the video says — optional CMS summary + attribution. */}
          {project.video?.summary ? (
            <div className="mt-6 max-w-3xl border-l-2 border-brass/60 pl-5">
              <div className="text-sm leading-7 text-ink-2/75">
                <RichTextContent data={project.video.summary} />
              </div>
              {project.video.speakerName ? (
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                  {project.video.speakerName}
                  {project.video.speakerRole ? ` — ${project.video.speakerRole}` : ''}
                </p>
              ) : null}
            </div>
          ) : null}
        </Section>
      )}

      <Section className="bg-white pt-0">
        <ProjectGallery images={project.gallery} title={project.title} />
      </Section>

      <LandscapingServiceAreas />
    </div>
  )
}
