import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TeamMemberPage } from '@/components/team/TeamMemberPage'
import { buildSeoMetadata, metaExcerpt } from '@/lib/seo'
import { resolveTeamMember } from '@/lib/team'

type Params = { params: Promise<{ slug: string }> }

/**
 * The member's own SEO group wins; otherwise the title is their name and the
 * description is cut from their bio — which is exactly what Rank Math emitted
 * for these pages on WordPress ("Noah | Prime Design & Build", and the bio's
 * first 158 characters). The social image is their photo, as it was there.
 */
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const member = await resolveTeamMember(slug)
  if (!member) return {}
  return buildSeoMetadata(
    member.seo,
    { title: member.name, description: metaExcerpt(member.description) },
    { path: `/team/${member.slug}`, image: member.image },
  )
}

export default async function TeamMemberRoute({ params }: Params) {
  const { slug } = await params
  const member = await resolveTeamMember(slug)
  if (!member) notFound()
  return <TeamMemberPage member={member} />
}
