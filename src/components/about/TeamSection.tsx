'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'

type TeamMember = {
  name: string
  role: string
  description: string
  initials: string
  image?: string
}

const team: TeamMember[] = [
  {
    name: 'Noah',
    role: 'CEO',
    initials: 'N',
    image: '/team/noah.webp',
    description:
      'With an unwavering vision and a strategic mindset, Noah leads Prime Design & Build toward innovation and success. He brings creativity and business acumen together to help every project reflect the client’s aspirations.',
  },
  {
    name: 'Jane Zamora',
    role: 'Executive Assistant to the CEO',
    initials: 'JZ',
    image: '/team/Jane-Show.webp',
    description:
      'Jane supports executive operations with a strong focus on organization, coordination, and follow-through. She keeps schedules, communication, and internal workflows aligned across the company.',
  },
  {
    name: 'Ariela',
    role: 'HR Manager',
    initials: 'A',
    image: '/team/ariela.webp',
    description:
      'Ariela supports team growth, culture, and compliance. Her people-first mindset helps create a positive and organized work environment for the entire Prime team.',
  },
  {
    name: 'Joseph Avri',
    role: 'Sales Manager',
    initials: 'JA',
    image: '/team/noah.webp',
    description:
      'Joseph helps homeowners understand their options and move from an early idea to a clear, practical project plan.',
  },
  {
    name: 'Isabella',
    role: 'Project Coordinator',
    initials: 'I',
    image: '/team/isabella.webp',
    description:
      'Isabella brings clarity, energy, and warmth to every project. She coordinates timelines, communication, and logistics so each client feels supported from day one.',
  },
  {
    name: 'Mahsa',
    role: 'Architectural Designer',
    initials: 'M',
    image: '/team/noah.webp',
    description:
      'Mahsa balances innovation with timeless design, bringing creativity, precision, and technical expertise to every architectural concept.',
  },
  {
    name: 'Juan',
    role: 'Superintendent',
    initials: 'J',
    image: '/team/noah.webp',
    description:
      'Juan manages day-to-day site operations, coordinates subcontractors, and keeps each phase of construction moving safely and efficiently.',
  },
  {
    name: 'Jelena',
    role: 'Executive Assistant to the DOO',
    initials: 'J',
    image: '/team/noah.webp',
    description:
      'Jelena supports daily operations through scheduling, coordination, and internal communication, helping projects and teams stay organized.',
  },
  {
    name: 'Hadar Adams',
    role: 'Senior Sales Specialist',
    initials: 'HA',
    image: '/team/noah.webp',
    description:
      'Hadar works closely with homeowners to understand goals, outline scopes, and set realistic expectations for a successful project start.',
  },
  {
    name: 'Gabrielle Alomia',
    role: 'Interior Designer',
    initials: 'GA',
    image: '/team/Gabrielle-Alomia.webp',
    description:
      'Gabrielle brings creativity and structure to layout, material selection, and finish coordination, always aligning the design with the build plan.',
  },
  {
    name: 'Charlotte Cheng',
    role: 'Senior Kitchen & Bath Designer',
    initials: 'CC',
    image: '/team/noah.webp',
    description:
      'Charlotte creates functional and elegant kitchen and bathroom spaces tailored to each client’s lifestyle, from concept through completion.',
  },
  {
    name: 'Jefelene Aton',
    role: 'AP/AR Bookkeeper',
    initials: 'JA',
    image: '/team/Jeff-Prime.webp',
    description:
      'Jefelene keeps project-related financial records accurate and organized, supporting smooth billing, payments, and reconciliations.',
  },
]

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
        <Image src={member.image} alt={member.image} fill className="object-cover object-top" />
      ) : (
        <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_20%,#c19a5b_0%,#1f3358_46%,#14213d_100%)]">
          <span className="font-display text-7xl font-medium text-white/85">{member.initials}</span>
        </div>
      )}
    </div>
  )
}

export function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass-deep">
            Meet the people behind the work
          </p>
          <h2 className="mt-4 font-display text-5xl font-medium leading-none tracking-tight text-ink-2 md:text-7xl">
            Meet our exceptional team
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-2/70">
            Our team of visionary leaders and dedicated professionals is committed to transforming
            your dreams into reality.
          </p>
        </div>

        <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {team.map((member) => (
            <article key={member.name} className="bg-paper p-4">
              <Portrait member={member} />
              <div className="flex items-end justify-between gap-4 px-2 pb-2 pt-5">
                <div>
                  <h3 className="font-display text-2xl font-medium text-ink-2">{member.name}</h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-2/60">
                    {member.role}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedMember(member)}
                >
                  Learn more
                </Button>
              </div>
            </article>
          ))}
        </div>
      </Container>

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
              ×
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
