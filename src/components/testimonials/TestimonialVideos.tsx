import website from '../../../website.json'
import { Section } from '@/components/ui/Section'

export function TestimonialVideos() {
  return (
    <Section className="bg-white pt-0">
      <div className="grid gap-8 md:grid-cols-2">
        {website.projectVideos.map((video, index) => (
          <figure key={video.videoUrl} className="overflow-hidden bg-ink">
            <video className="aspect-video h-auto w-full object-cover" controls muted playsInline preload="metadata">
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <figcaption className="border border-t-0 border-line bg-paper px-5 py-4">
              <p className="font-display text-xl text-ink-2">{video.title || `Project video ${index + 1}`}</p>
              {video.projectManager || video.speaker ? <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-2/55">{video.projectManager || video.speaker}</p> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </Section>
  )
}
