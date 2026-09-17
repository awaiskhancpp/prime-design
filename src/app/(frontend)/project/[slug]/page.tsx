import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetailPage } from '@/components/projects/ProjectDetailPage'
import { projects, resolveProjectBySlug } from '@/lib/projects'
import { buildSeoMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/seo/JsonLd'
import { breadcrumbSchema, graph } from '@/lib/structuredData'

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = await resolveProjectBySlug(slug)
  if (!project) return { title: 'Project | Prime Design & Build' }

  // Uses the migrated WordPress (Rank Math) metadata, with the project's own
  // copy as the fallback.
  return buildSeoMetadata(
    project.seo,
    { title: project.title, description: project.summary || project.description },
    { path: `/project/${slug}`, image: project.heroImage },
  )
}

export default async function ProjectRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = await resolveProjectBySlug(slug)

  if (!project) notFound()

  return (
    <>
      <ProjectDetailPage project={project} />
      <JsonLd
        data={graph(
          breadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Projects', path: '/our-projects' },
            { name: project.title, path: `/project/${slug}` },
          ]),
        )}
      />
    </>
  )
}
