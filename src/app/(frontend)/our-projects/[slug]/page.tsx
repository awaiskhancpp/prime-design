import { permanentRedirect } from 'next/navigation'

export default async function ProjectDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  permanentRedirect(`/project/${slug}`)
}
