'use client'

import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { X } from 'lucide-react'

type TeamMember = {
  name: string
  role: string
  description?: string
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
      'With an unwavering vision and a strategic mindset, Noah leads Prime Design and Build toward innovation and success. As the CEO, he brings together a perfect blend of creativity and business acumen to drive the company’s growth. With a genuine dedication to crafting extraordinary living spaces, Noah ensures that every project reflects the values and aspirations of our clients.',
  },
  {
    name: 'Jane Zamora',
    role: 'Executive Assistant to the CEO',
    initials: 'JZ',
    image: '/team/Jane-Show.webp',
    description:
      'Jane supports executive operations at Prime Design and Build with a strong focus on organization, coordination, and follow through. She manages schedules, communication, and internal workflows to keep leadership aligned and operations running efficiently. Her attention to detail and reliability help ensure smooth day to day execution across the company.',
  },
  {
    name: 'Ariela',
    role: 'HR Manager',
    initials: 'A',
    image: '/team/ariela.webp',
    description:
      'Ariela oversees human resources at Prime Design and Build, supporting team growth, culture, and compliance. She manages hiring, onboarding, and internal policies while fostering a positive and organized work environment. Her people first mindset helps build strong teams and long term stability.',
  },
  {
    name: 'Joseph Avri',
    role: 'Sales Manager',
    initials: 'JA',
    image: '/team/joseph-avri.webp',
  },
  {
    name: 'Isabella',
    role: 'Project Coordinator',
    initials: 'I',
    image: '/team/isabella.webp',
    description:
      'With a passion for people and a talent for coordination, Isabella brings clarity, energy, and warmth to every project she touches. As Project Coordinator at Prime Design & Build, she ensures each client feels supported from day one—managing timelines, communication, and logistics with confidence and care. Known for her upbeat approach and strong relationships, Isabella plays a key role in turning big ideas into beautifully built realities, all while making the journey as smooth and enjoyable as possible.',
  },
  {
    name: 'Mahsa',
    role: 'Architectural Designer',
    initials: 'M',
    image: '/team/mahsa.jpg',
    description:
      'With a keen eye for detail and a passion for functional beauty, Mahsa shapes spaces that balance innovation with timeless design. As an Architectural Designer at Prime Design and Build, she brings creativity, precision and technical expertise to every project. Guided by a deep commitment to enhancing how people live and interact with their environments, Mahsa transforms concepts into thoughtful architectural solutions that inspire and endure.',
  },
  {
    name: 'Juan',
    role: 'Superintendent',
    initials: 'J',
    image: '/team/juan.png',
    description:
      'Juan brings strong leadership and organizational skills to his role as Superintendent at Prime Design and Build. With extensive field experience, he manages day-to-day site operations, coordinates subcontractors and ensures that every phase of construction runs efficiently and to the highest standard. Committed to safety, quality and teamwork, Juan plays a key role in turning project plans into reality while keeping clients’ visions at the center of the process.',
  },
  {
    name: 'Jelena',
    role: 'Executive Assistant to the DOO',
    initials: 'J',
    image: '/team/jelena.jpeg',
    description:
      'Jelena supports daily operations by assisting the Director of Operations with scheduling, coordination, and internal communication. She helps keep projects, teams, and timelines organized while ensuring operational workflows run smoothly. Her structure and responsiveness support efficiency across departments.',
  },
  {
    name: 'Hadar Adams',
    role: 'Senior Sales Specialist',
    initials: 'HA',
    image: '/team/hadar-adams.jpg',
    description:
      'Hadar leads client engagement with experience and insight as a Senior Sales Specialist. She works closely with homeowners to understand goals, outline scopes, and set realistic expectations. Her consultative approach helps create strong relationships and successful project starts.',
  },
  {
    name: 'Gabrielle Alomia',
    role: 'Interior Designer',
    initials: 'GA',
    image: '/team/Gabrielle-Alomia.webp',
    description:
      'Gabrielle brings creativity and structure to interior design at Prime Design and Build. She focuses on layout, material selection, and finish coordination to create spaces that feel intentional and elevated. Her collaborative process ensures each design aligns with both the client vision and the build plan.',
  },
  {
    name: 'Charlotte Cheng',
    role: 'Senior Kitchen & Bath Designer',
    initials: 'CC',
    image: '/team/charlotte-cheng.webp',
    description:
      'Charlotte leads kitchen and bathroom design projects at Prime Design and Build, creating functional and elegant spaces tailored to each client’s lifestyle. She specializes in space planning, material selection, and design development, ensuring every project is both beautiful and practical from concept to completion.',
  },
  {
    name: 'Jefelene Aton',
    role: 'AP/AR Bookkeeper',
    initials: 'JA',
    image: '/team/Jeff-Prime.webp',
    description:
      'Jef oversees Accounts Payable and Accounts Receivable for Prime Design and Build, ensuring all project-related financial transactions are accurately recorded and well organized. She manages vendor payments, client invoicing, and ongoing account reconciliations to maintain smooth and timely cash flow across active projects. With a strong focus on accuracy and consistency, Jef supports the finance and operations teams by keeping financial records up to date and ensuring all billing and payments align with company standards.',
  },
]

function Portrait({
  member,
  variant = 'grid',
}: {
  member: TeamMember
  variant?: 'grid' | 'modal' | 'featured'
}) {
  const aspectClasses =
    variant === 'modal'
      ? 'aspect-[4/3] md:aspect-auto md:h-full md:min-h-[26rem]'
      : variant === 'featured'
        ? 'aspect-[4/3]'
        : 'aspect-[4/5]'

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

function TeamCard({
  member,
  onClick,
  variant = 'grid',
}: {
  member: TeamMember
  onClick: () => void
  variant?: 'grid' | 'featured'
}) {
  return (
    <article className="border border-line bg-white transition-colors hover:border-brass">
      <Portrait member={member} variant={variant} />
      <div className="flex items-end justify-between gap-4 border-t border-line px-6 py-6">
        <div>
          <h3 className="font-display text-2xl font-medium text-ink-2">{member.name}</h3>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.1em] text-ink-2/60">
            {member.role}
          </p>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={onClick}>
          Learn more
        </Button>
      </div>
    </article>
  )
}

export function TeamSection() {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  // Separate the CEO (first item) from the rest of the team
  const [ceo, ...restOfTeam] = team

  return (
    <section className="bg-white py-16 md:py-24 lg:py-32">
      <Container>
        {/* Main Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-brass-deep">
            Driven by Passion, Guided by Expertise
          </p>
          <h2 className="mt-4 font-display text-5xl font-medium leading-none tracking-tight text-ink-2 md:text-7xl">
            Meet our exceptional Team
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-ink-2/70">
            Our team of visionary leaders and dedicated professionals is committed to transforming
            your dreams into reality. With years of experience and a shared passion for excellence,
            we are here to deliver unparalleled service and create stunning spaces that exceed your
            expectations.
          </p>
          <Button variant="outline" href="#contact" className="mt-8">
            Speak with Our Team
          </Button>
        </div>

        {/* Featured Section: Text + Bounded CEO Card — both columns sized to
            match each other in height (items-center + a shorter 4:3 crop on
            the featured card) instead of a tall portrait card towering over
            a much shorter text block. */}
        <div className="mt-20 grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <h2 className="font-display text-4xl font-medium leading-tight text-ink-2 md:text-5xl">
              Meet the team
            </h2>
            <p className="mt-2 text-2xl italic text-brass-deep/80">
              The Faces Behind Prime Design and Build
            </p>
            <div className="mt-6 h-1 w-12 bg-brass" aria-hidden />
            <p className="mt-6 text-base leading-7 text-ink-2/75">
              Here, we showcase the talented individuals who bring their expertise, passion, and
              creativity to Prime Design & Build. Each team member plays a vital role in shaping our
              company&apos;s success and delivering outstanding results for our clients. Through
              their dedication, skill, and commitment to craftsmanship, our team ensures that your
              home remodeling journey is nothing short of exceptional. Explore below to get to know
              the faces behind Prime Design & Build and discover the talent that sets us apart.
            </p>
          </div>

          <div className="w-full max-w-md md:ml-auto">
            <TeamCard member={ceo} onClick={() => setSelectedMember(ceo)} variant="featured" />
          </div>
        </div>

        {/* Remaining Team Grid */}
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
