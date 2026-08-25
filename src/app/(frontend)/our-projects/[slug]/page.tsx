import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProjectDetailPage } from '@/components/projects/ProjectDetailPage'
import { getProjectBySlug, projects } from '@/lib/projects'

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  return {
    title: project ? `${project.title} | Prime Design & Build` : 'Project | Prime Design & Build',
    description: project?.summary,
  }
}

export default async function ProjectDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const project = getProjectBySlug(slug)

  if (!project) notFound()

  return <ProjectDetailPage project={project} />
}
