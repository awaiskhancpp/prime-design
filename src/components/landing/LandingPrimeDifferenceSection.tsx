import { Check } from 'lucide-react'

import { Section } from '@/components/ui/Section'
import { VideoCarousel, type CarouselVideo } from './VideoCarousel'

const statLine = 'Over 350+ Projects in Silicon Valley'

const bullets = [
  { lead: '', text: 'Experts on-site for interior design' },
  { lead: '', text: 'Certified general contractor, fully licensed' },
  { lead: 'Family-owned', text: ' and operated business' },
  { lead: 'Competitive', text: ' pricing for our services' },
  { lead: 'Quick response', text: ' for customer satisfaction' },
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

type LandingPrimeDifferenceSectionProps = {
  eyebrow?: string
  heading?: string
  body?: string
  checklist?: string[]
  videos?: CarouselVideo[]
}

export function LandingPrimeDifferenceSection({
  eyebrow,
  heading,
  body,
  checklist,
  videos,
}: LandingPrimeDifferenceSectionProps) {
  const activeChecklist = checklist ?? bullets.map((bullet) => `${bullet.lead}${bullet.text}`)
  const activeVideos =
    videos ??
    projectVideos.map((video) => ({ url: video.url, poster: video.poster, caption: video.title }))

  return (
    <Section className="bg-ink-2 text-white">
      <div className="grid gap-12 md:grid-cols-12 md:items-center md:gap-10 lg:gap-10">
        <div className="col-span-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrow ?? statLine}
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight md:text-4xl">
            {heading ?? 'The Prime Difference'}
          </h2>

          {body && <p className="mt-5 leading-relaxed text-white/75">{body}</p>}

          <ul className="mt-8 space-y-4">
            {activeChecklist.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span
                  aria-hidden
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] text-ink"
                >
                  <Check className="h-3 w-3" />
                </span>
                <span className="italic leading-relaxed text-white/80">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="col-span-6">
          {activeVideos.length ? <VideoCarousel videos={activeVideos} dark /> : null}
        </div>
      </div>
    </Section>
  )
}
