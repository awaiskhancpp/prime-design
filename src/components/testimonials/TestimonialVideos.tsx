import { Section } from '@/components/ui/Section'
import type { PageTestimonialVideosContent } from '@/lib/pageSections'

/**
 * The Testimonials page video wall — the WordPress page's second Bricks
 * section, which is a plain row of `<video>` elements.
 *
 * Every string and URL comes from the `testimonial-videos` block on the page
 * record. No fallback copy: a card with no title renders without one.
 */
export function TestimonialVideos({ content }: { content: PageTestimonialVideosContent }) {
  if (!content.videos.length) return null

  return (
    <Section className="bg-white pt-0">
      {content.heading ? (
        <h2 className="mb-8 font-display text-3xl font-medium text-ink-2">{content.heading}</h2>
      ) : null}
      {content.description ? (
        <p className="mb-8 max-w-2xl text-base leading-7 text-ink-2/75">{content.description}</p>
      ) : null}
      <div className="grid gap-8 md:grid-cols-2">
        {content.videos.map((video) => (
          <figure key={video.url} className="overflow-hidden bg-paper">
            <video
              className="aspect-video h-auto w-full object-cover"
              controls
              playsInline
              preload="none"
              poster={video.poster}
            >
              <source src={video.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            {video.title || video.speaker ? (
              <figcaption className="border border-t-0 border-line bg-paper px-5 py-4">
                {video.title ? (
                  <p className="font-display text-xl text-ink-2">{video.title}</p>
                ) : null}
                {video.speaker ? (
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-ink-2/55">
                    {video.speaker}
                  </p>
                ) : null}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  )
}
