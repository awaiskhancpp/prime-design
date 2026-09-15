import type { ReactNode } from 'react'

import { Section } from '@/components/ui/Section'
import type { Location } from '@/lib/serviceLocations'

// All hosted in the company blob (optimized 1080p H.264 cuts — see
// scripts/upload-missing-media.ts and the video optimization pass); the old
// tagmediaspace Bunny CDN hotlinks are kept only as media.sourceUrl
// provenance on the media documents.
const kitchenVideo = '/api/media/file/ilay-alice-ave-kitchen.mp4'
const fullHomeVideo = '/api/media/file/josef-bluebonnet-morgan-hill.mp4'
const firstFloorVideo = '/api/media/file/first-floor-renovation.mp4'
const noahIntroVideo = '/api/media/file/noah-prime-intro.mp4'

// Poster frames for the same clips.
const kitchenPoster = '/api/media/file/ilay-alice-ave-kitchen-poster.jpg'
const fullHomePoster = '/api/media/file/josef-bluebonnet-morgan-hill-poster.jpg'
const noahPoster = '/api/media/file/noah-prime-intro-poster.jpg'
const firstFloorPoster = '/api/media/file/first-floor-renovation-poster.jpg'

export type ServiceVideoContent = {
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  tagline?: ReactNode
  videoUrl: string
  poster?: string
  /** What the video says (CMS `summary`), rendered under the player. */
  summary?: ReactNode
  /** Only when the video itself names the speaker. */
  speakerName?: string
  speakerRole?: string
}

const videosBySlug: Record<string, ServiceVideoContent> = {
  'kitchen-remodeling': {
    eyebrow: 'Kitchen remodeling',
    title: 'Take a tour through one of our stunning kitchen transformations',
    videoUrl: kitchenVideo,
    poster: kitchenPoster,
  },
  'home-remodeling': {
    eyebrow: 'Home remodeling',
    title: 'See a full-home transformation in Silicon Valley',
    videoUrl: fullHomeVideo,
    poster: fullHomePoster,
  },
  'complete-renovation': {
    eyebrow: 'Complete renovation',
    title: 'Take a tour through one of our complete home renovations',
    videoUrl: fullHomeVideo,
    poster: fullHomePoster,
  },
  additions: {
    eyebrow: 'Home additions',
    title: 'See how we expand homes with thoughtful additions',
    videoUrl: firstFloorVideo,
    poster: firstFloorPoster,
  },
  'european-kitchen-silicon-valley': {
    eyebrow: 'European kitchens',
    title: 'Take a tour through one of our European kitchen transformations',
    videoUrl: kitchenVideo,
    poster: kitchenPoster,
  },
  'shaker-kitchen-silicon-valley': {
    eyebrow: 'Shaker kitchens',
    title: 'Hear from our team on what makes a Shaker kitchen work',
    videoUrl: noahIntroVideo,
    poster: noahPoster,
  },
  'custom-kitchen-silicon-valley': {
    eyebrow: 'Custom kitchens',
    title: 'Take a tour through one of our custom kitchen transformations',
    videoUrl: kitchenVideo,
    poster: kitchenPoster,
  },
}

export function ServiceVideoSection({
  eyebrow,
  title,
  description,
  tagline,
  videoUrl,
  poster,
  summary,
  speakerName,
  speakerRole,
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
          preload="none"
          poster={poster}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {summary ? (
        <div className="mx-auto mt-8 max-w-3xl border-l-2 border-brass/60 pl-5 text-left">
          <div className="text-sm leading-7 text-ink-2/75">{summary}</div>
          {speakerName ? (
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
              {speakerName}
              {speakerRole ? ` — ${speakerRole}` : ''}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  )

  if (embedded) return content

  return <Section className="bg-white">{content}</Section>
}
