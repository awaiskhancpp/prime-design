import type { ReactNode } from 'react'

import { Section } from '@/components/ui/Section'
import type { Location } from '@/lib/serviceLocations'

const kitchenVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4'
const fullHomeVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4'
const firstFloorVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/First%20Floor.mp4'
const noahIntroVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Vid%20Noah.mp4'

export type ServiceVideoContent = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  tagline?: ReactNode
  videoUrl: string
  poster?: string
}

const videosBySlug: Record<string, ServiceVideoContent> = {
  'kitchen-remodeling': {
    eyebrow: 'Kitchen remodeling',
    title: 'Take a tour through one of our stunning kitchen transformations',
    videoUrl: kitchenVideo,
    poster: '/services/kitchen-remodeling.jpeg',
  },
  'home-remodeling': {
    eyebrow: 'Home remodeling',
    title: 'See a full-home transformation in Silicon Valley',
    videoUrl: fullHomeVideo,
    poster: '/services/home-remodeling.jpeg',
  },
  'complete-renovation': {
    eyebrow: 'Complete renovation',
    title: 'Take a tour through one of our complete home renovations',
    videoUrl: fullHomeVideo,
    poster: '/before-after/complete_remodeling_after.jpeg',
  },
  additions: {
    eyebrow: 'Home additions',
    title: 'See how we expand homes with thoughtful additions',
    videoUrl: firstFloorVideo,
    poster: '/services/home-remodeling.jpeg',
  },
  'european-kitchen-silicon-valley': {
    eyebrow: 'European kitchens',
    title: 'Take a tour through one of our European kitchen transformations',
    videoUrl: kitchenVideo,
    poster: '/services/kitchen-remodeling.jpeg',
  },
  'shaker-kitchen-silicon-valley': {
    eyebrow: 'Shaker kitchens',
    title: 'Hear from our team on what makes a Shaker kitchen work',
    videoUrl: noahIntroVideo,
    poster: '/services/kitchen-remodeling.jpeg',
  },
  'custom-kitchen-silicon-valley': {
    eyebrow: 'Custom kitchens',
    title: 'Take a tour through one of our custom kitchen transformations',
    videoUrl: kitchenVideo,
    poster: '/services/kitchen-remodeling.jpeg',
  },
}

export function ServiceVideoSection({
  eyebrow,
  title,
  description,
  tagline,
  videoUrl,
  poster,
  embedded = false,
}: ServiceVideoContent & { embedded?: boolean }) {
  if (!videoUrl) return null

  const content = (
    <>
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className="font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mx-auto max-w-xl text-base leading-[1.7] text-ink-2/70">{description}</p>
        ) : null}
        {tagline ? (
          <p className="mx-auto max-w-xl text-base leading-[1.7] text-ink-2/70">{tagline}</p>
        ) : null}
      </div>

      <div className="mx-auto mt-10 max-w-5xl overflow-hidden bg-ink">
        <video
          className="aspect-video h-auto w-full object-cover"
          controls
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </>
  )

  if (embedded) return content

  return <Section className="bg-white">{content}</Section>
}
