import { Section } from '@/components/ui/Section'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { SectionHeader } from '@/components/ui/SectionHeader'
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
    <Section className="bg-white pt-10 ">
      {content.heading ? (
        <div className="mb-12">
          <SectionHeader title={content.heading} description={content.description ?? undefined} />
        </div>
      ) : null}

      <div className="grid gap-8 md:grid-cols-2">
        {content.videos.map((video) => (
          <figure
            key={video.url}
            className="group relative border border-transparent bg-paper transition-colors duration-300 hover:border-line"
          >
            {/* Brass corner accent — same squared-off hover language as
                ProjectCard and the rest of the UI */}
            <span
              className="pointer-events-none absolute left-0 top-0 h-px w-0 bg-brass transition-[width] duration-500 ease-out group-hover:w-10"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute left-0 top-0 h-0 w-px bg-brass transition-[height] duration-500 ease-out group-hover:h-10"
              aria-hidden="true"
            />

            <VideoPlayer
              src={video.url}
              poster={video.poster}
              label={video.title || 'testimonial'}
              className="aspect-video w-full"
            />

            {video.title || video.speaker ? (
              <figcaption className="border-t border-line px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="border-l-2 border-brass/60 pl-4">
                    {video.title ? (
                      <p className="font-display text-lg font-medium text-ink-2">{video.title}</p>
                    ) : null}
                    {video.speaker ? (
                      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-brass-deep">
                        {video.speaker}
                      </p>
                    ) : null}
                  </div>
                </div>
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </Section>
  )
}
