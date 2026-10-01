import Link from 'next/link'
import type { ReactNode } from 'react'

import Image from '@/components/ui/Image'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageTeamIntroContent } from '@/lib/pageSections'
import type { AboutTeamMember } from '@/lib/team'
import { ArrowRight } from 'lucide-react'

type TeamMember = {
  name: string
  slug: string
  role: string
  description?: string
  initials: string
  image?: string
}

function Portrait({ member }: { member: TeamMember }) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink-2">
      {member.image ? (
        // `alt` used to be the image URL, which is what showed up as text
        // inside the frame whenever a portrait failed to load.
        <Image
          src={member.image}
          alt={member.name}
          fill
          className="object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#c19a5b_0%,#1f3358_46%,#14213d_100%)]">
          <span className="font-display text-7xl font-medium text-white/85">{member.initials}</span>
        </div>
      )}
    </div>
  )
}

/**
 * A member's card links to their own page (`/team/<slug>`). It used to open
 * a dialog with the same photo, name, role and bio — two renderings of one
 * member, the dialog's with a typed-out company name as its eyebrow.
 */
function TeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group border border-line bg-white transition-colors hover:border-brass">
      <Link href={`/team/${member.slug}`} className="block w-full text-left">
        <div className="overflow-hidden">
          <Portrait member={member} />
        </div>

        <div className="border-t border-line px-5 py-5">
          <h3 className="font-display text-xl font-medium leading-tight text-ink-2">
            {member.name}
          </h3>
          <p className="mt-1.5 text-xs font-semibold uppercase leading-5 tracking-[0.1em] text-ink-2/60">
            {member.role}
          </p>
          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brass-deep transition-all duration-200 group-hover:gap-2.5">
            Learn More
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
      </Link>
    </article>
  )
}

export function TeamSection({
  teamIntro,
  bodyContent,
  introBodyContent,
  members,
  headingLevel: Heading = 'h2',
}: {
  teamIntro?: PageTeamIntroContent
  /** `h1` when this section opens the page; see `PageSectionContext`. */
  headingLevel?: 'h1' | 'h2'
  /** Rich-text body rendered by the server (RichTextContent). */
  bodyContent?: ReactNode
  /** Rich-text intro body rendered by the server (RichTextContent). */
  introBodyContent?: ReactNode
  /** Team members from the Payload Team collection (falls back to the built-in list). */
  members?: AboutTeamMember[]
}) {
  const displayTeam: TeamMember[] = (members ?? []).map((member) => ({
    name: member.name,
    slug: member.slug,
    role: member.role,
    description: member.description,
    image: member.image,
    initials: member.name
      .split(' ')
      .map((part) => part[0] || '')
      .join('')
      .slice(0, 2),
  }))

  // Separate the CEO (first item) from the rest of the team
  const [ceo, ...restOfTeam] = displayTeam

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        {/* Main Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass-deep">
            {teamIntro?.eyebrow}
          </p>
          <Heading className="mt-4 font-display text-5xl font-medium leading-none tracking-tight text-ink-2 md:text-7xl">
            <HighlightedText
              text={teamIntro?.heading ?? ''}
              highlight={teamIntro?.headingHighlight}
            />
          </Heading>
          <div className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-2/70">
            {bodyContent}
          </div>
          {teamIntro?.ctaLabel ? (
            <Button
              variant="outline"
              href={teamIntro.ctaHref || '#contact'}
              arrow
              className="mt-8"
            >
              {teamIntro.ctaLabel}
            </Button>
          ) : null}
        </div>

        {/* Featured row: paragraph + CEO card, side by side. Uses the SAME
            4-column grid as the team grid below (text spans 3 columns,
            card spans 1), so the CEO card's width matches the grid cards
            below exactly — same track math, not a guessed max-width. */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:items-center">
          <div className="md:col-span-1 lg:col-span-3">
            <h2 className="font-display text-4xl font-medium leading-tight text-ink-2 md:text-5xl">
              {teamIntro?.introHeading}
            </h2>
            <p className="mt-2 text-2xl italic text-brass-deep/80">{teamIntro?.introSubheading}</p>
            <div className="mt-6 h-1 w-12 bg-brass" aria-hidden />
            <div className="mt-6 max-w-xl text-base leading-7 text-ink-2/75">
              {introBodyContent}
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-1">
            {ceo ? <TeamCard member={ceo} /> : null}
          </div>
        </div>

        {/* Remaining Team Grid — 4 per row at lg, identical column
            structure as the row above so every card (including the CEO's)
            is the same width. */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {restOfTeam.map((member) => (
            <TeamCard key={member.slug} member={member} />
          ))}
        </div>
      </Container>

    </section>
  )
}
