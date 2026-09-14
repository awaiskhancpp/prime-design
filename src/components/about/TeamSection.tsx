'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageTeamIntroContent } from '@/lib/pageSections'
import type { AboutTeamMember } from '@/lib/team'
import { X } from 'lucide-react'

type TeamMember = {
  name: string
  role: string
  description?: string
  initials: string
  image?: string
}


function Portrait({
  member,
  variant = 'grid',
}: {
  member: TeamMember
  variant?: 'grid' | 'modal'
}) {
  const aspectClasses =
    variant === 'modal' ? 'aspect-[4/3] md:aspect-auto md:h-full md:min-h-[26rem]' : 'aspect-[4/5]'

  return (
    <div className={`relative overflow-hidden bg-ink-2 ${aspectClasses}`}>
      {member.image ? (
        // `alt` used to be the image URL, which is what showed up as text
        // inside the frame whenever a portrait failed to load.
        <Image src={member.image} alt={member.name} fill className="object-cover object-top" />
      ) : (
        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#c19a5b_0%,#1f3358_46%,#14213d_100%)]">
          <span className="font-display text-7xl font-medium text-white/85">{member.initials}</span>
        </div>
      )}
    </div>
  )
}

function TeamCard({ member, onClick }: { member: TeamMember; onClick: () => void }) {
  return (
    <article className="border border-line bg-white transition-colors hover:border-brass">
      <Portrait member={member} />

      <div className="flex flex-col gap-2 lg:gap-5 border-t border-line px-3 py-5 sm:px-2 sm:py-3 md:flex-row md:items-center md:justify-between md:gap-4 lg:px-6 lg:py-6">
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-2xl font-medium leading-tight text-ink-2">
            {member.name}
          </h3>

          <p className="mt-2 text-xs font-semibold uppercase leading-5 tracking-[0.1em] text-ink-2/60">
            {member.role}
          </p>
        </div>

        <div className="shrink-0">
          <Button type="button" variant="secondary" size="sm" onClick={onClick}>
            Learn more
          </Button>
        </div>
      </div>
    </article>
  )
}

export function TeamSection({
  teamIntro,
  bodyContent,
  introBodyContent,
  members,
}: {
  teamIntro?: PageTeamIntroContent
  /** Rich-text body rendered by the server (RichTextContent). */
  bodyContent?: ReactNode
  /** Rich-text intro body rendered by the server (RichTextContent). */
  introBodyContent?: ReactNode
  /** Team members from the Payload Team collection (falls back to the built-in list). */
  members?: AboutTeamMember[]
}) {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const displayTeam: TeamMember[] = (members ?? []).map((member) => ({
    name: member.name,
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
          <h2 className="mt-4 font-display text-5xl font-medium leading-none tracking-tight text-ink-2 md:text-7xl">
            <HighlightedText text={teamIntro?.heading ?? ''} highlight={teamIntro?.headingHighlight} />
          </h2>
          <div className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-2/70">
            {bodyContent}
          </div>
          {teamIntro?.ctaLabel ? (
            <Button variant="outline" href={teamIntro.ctaHref || '#contact'} className="mt-8">
              {teamIntro.ctaLabel}
            </Button>
          ) : null}
        </div>

        {/* Featured row: paragraph + CEO card, side by side. This uses the
            SAME column grid (md:grid-cols-2 lg:grid-cols-3) as the team
            grid below, with the card taking exactly one column and the
            text taking the rest. That's what makes the card's width
            identical to the grid cards below — same track math, not a
            separately guessed max-width. The card itself also uses the
            default 'grid' Portrait variant (aspect-[4/5]), same as every
            other card, so the aspect ratio matches too. */}
        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:items-center">
          <div className="md:col-span-1 lg:col-span-2">
            <h2 className="font-display text-4xl font-medium leading-tight text-ink-2 md:text-5xl">
              {teamIntro?.introHeading}
            </h2>
            <p className="mt-2 text-2xl italic text-brass-deep/80">
              {teamIntro?.introSubheading}
            </p>
            <div className="mt-6 h-1 w-12 bg-brass" aria-hidden />
            <div className="mt-6 max-w-xl text-base leading-7 text-ink-2/75">
              {introBodyContent}
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-1">
            <TeamCard member={ceo} onClick={() => setSelectedMember(ceo)} />
          </div>
        </div>

        {/* Remaining Team Grid — identical column structure as the row
            above, so every card (including the CEO's, above) is the same
            width. */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {restOfTeam.map((member) => (
            <TeamCard key={member.name} member={member} onClick={() => setSelectedMember(member)} />
          ))}
        </div>
      </Container>

      {/* Modal */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedMember(null)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-member-name"
            className="relative grid max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-paper shadow-2xl md:grid-cols-[0.95fr_1.05fr]"
          >
            <button
              type="button"
              onClick={() => setSelectedMember(null)}
              aria-label="Close team member details"
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center border border-ink/20 bg-paper text-ink hover:bg-ink hover:text-white"
            >
              <X />
            </button>
            <Portrait member={selectedMember} variant="modal" />
            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
                Prime Design & Build
              </p>
              <h2
                id="team-member-name"
                className="mt-5 font-display text-5xl font-medium leading-none text-ink-2"
              >
                {selectedMember.name}
              </h2>
              <p className="mt-4 text-xl text-ink-2/75">{selectedMember.role}</p>
              <p className="mt-7 text-base leading-8 text-ink-2/75">{selectedMember.description}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
