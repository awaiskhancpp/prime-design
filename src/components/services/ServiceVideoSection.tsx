import { Section } from '@/components/ui/Section'
import { SectionHeader } from '@/components/ui/SectionHeader'

const kitchenVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4'
const fullHomeVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4'
const firstFloorVideo =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/First%20Floor.mp4'

export type ServiceVideoContent = {
  eyebrow?: string
  title: string
  description?: string
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
}

export function getServiceVideo(slug: string) {
  return videosBySlug[slug]
}

export function ServiceVideoSection({
  eyebrow,
  title,
  description,
  videoUrl,
  poster,
  embedded = false,
}: ServiceVideoContent & { embedded?: boolean }) {
  if (!videoUrl) return null

  const content = (
    <>
      <SectionHeader align="center" eyebrow={eyebrow} title={title} description={description} />

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
