'use client'

import { useState } from 'react'

import { Section } from '@/components/ui/Section'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'

const statLine = 'Over 350+ Projects in Silicon Valley'

const bullets = [
  { lead: '', text: 'Experts on-site for interior design' },
  { lead: '', text: 'Certified general contractor, fully licensed' },
  { lead: 'Family-owned', text: ' and operated business' },
  { lead: 'Competitive', text: ' pricing for our services' },
  { lead: 'Quick response', text: ' for customer satisfaction' },
]
const socials = [
  '/social/BB-ACCREDITED.jpeg',
  '/social/Google.png',
  '/social/houzz.png',
  '/social/Yelp.png',
]

const projectVideos = [
  {
    title: 'Noah, Co-Owner',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Vid%20Noah.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'Rosewood Dr, Atherton',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/03.09.2024%20Noam%20Prime%2041%20Rosewood%20Dr%20Atherton.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'Alice Ave, Mountain View',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4',
    poster: '/services/kitchen-remodeling.jpeg',
  },
  {
    title: 'Bluebonnet Ct, Morgan Hill',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
  {
    title: 'First floor renovation',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/First%20Floor.mp4',
    poster: '/services/home-remodeling.jpeg',
  },
]

export function LandscapingDifference() {
  const [active, setActive] = useState(projectVideos[0])

  return (
    <Section className="">
      <div className="mb-12 flex gap-5 justify-center">
        {socials.map((s, i) => (
          <Image src={s} alt="" key={i} width={180} height={90} />
        ))}
      </div>
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden bg-ink">
            <video
              key={active.url}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
              poster={active.poster}
            >
              <source src={active.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-3 grid grid-cols-5 gap-2">
            {projectVideos.map((video) => (
              <button
                key={video.url}
                type="button"
                onClick={() => setActive(video)}
                aria-label={`Play video: ${video.title}`}
                aria-pressed={active.url === video.url}
                className={cn(
                  'relative aspect-video overflow-hidden border-2 bg-cover bg-center transition-colors',
                  active.url === video.url
                    ? 'border-brass'
                    : 'border-transparent hover:border-line',
                )}
                style={{ backgroundImage: `url(${video.poster})` }}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {statLine}
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
            The Prime <span className="text-brass">Difference</span>
          </h2>

          <ul className="mt-8 space-y-4">
            {bullets.map((bullet) => (
              <li key={bullet.lead + bullet.text} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className=" flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-paper"
                >
                  <Check />
                </span>
                <span className="italic leading-relaxed text-ink-2/80">
                  {bullet.lead && (
                    <span className="font-semibold not-italic text-ink-2">{bullet.lead}</span>
                  )}
                  {bullet.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
