'use client'

import { useState } from 'react'

import { Section } from '@/components/ui/Section'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageDifferenceContent } from '@/lib/pageSections'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import { cn } from '@/lib/utils'
import { ArrowRight, Check, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Link from 'next/link'
import Image from '@/components/ui/Image'

export function LandscapingDifference({
  difference,
  projectHrefByVideo,
}: {
  difference?: PageDifferenceContent
  /** Video filename -> project URL, resolved from the Projects collection. */
  projectHrefByVideo?: Record<string, string>
}) {
  // The project videos come from the section's `videos` array in Payload.
  const projectVideos = difference?.videos?.length ? difference.videos : []

  const [index, setIndex] = useState(0)
  const active = projectVideos[index]
  /** Matched on filename, so the URL's host and query do not matter. */
  const activeProjectHref = active
    ? projectHrefByVideo?.[(active.url.split(/[?#]/)[0].split('/').pop() || '').toLowerCase()]
    : undefined
  // Only used to stop auto-advance at the end; the arrows always work.
  const canGoNext = index < projectVideos.length - 1

  // Wraps in both directions: from the first clip, Previous goes to the last,
  // and from the last, Next returns to the first. Auto-advance on a video
  // ending deliberately does NOT wrap — looping the whole set unprompted
  // would restart playback on a visitor who has watched to the end.
  const total = projectVideos.length
  function goPrev() {
    setIndex((current) => (current - 1 + total) % total)
  }
  function goNext() {
    setIndex((current) => (current + 1) % total)
  }
  function handleEnded() {
    if (canGoNext) goNext()
  }

  const statLine = difference?.eyebrow
  const heading = difference?.heading ?? ''
  const checklist = difference?.checklist ?? []

  return (
    // No review badges here any more: they moved into the proof band at the
    // top of `LandscapingIntro`, beside the stats they corroborate.
    <Section className="">
      {/* Heading banner — eyebrow + heading sit above the whole showcase,
          framing it as one story to scroll through rather than a heading
          competing side-by-side with the video for attention. */}
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
          {statLine}
        </p>
        <h2 className="mt-3 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
          <HighlightedText text={heading} highlight={difference?.headingHighlight} />
        </h2>
      </div>

      {/* Flex (not grid) so an incomplete final row centers itself: with 5
          items this gives 3 on top and the remaining 2 centered beneath,
          instead of grid's default left-alignment leaving a gap on the
          right. Basis matches a 3-up row; it reflows to 1-up on mobile. */}
      {checklist.length > 0 ? (
        <ul className="mx-auto mt-6 flex max-w-5xl flex-wrap justify-center gap-x-8 gap-y-4">
          {checklist.map((bullet) => (
            <li
              key={bullet.lead + bullet.text}
              className="flex w-full items-start gap-3 sm:w-[calc(33.333%-1.5rem)]"
            >
              <span
                aria-hidden
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] text-paper"
              >
                <Check className="h-3 w-3" />
              </span>
              <span className="text-sm italic leading-relaxed text-ink-2/80">
                {bullet.lead && (
                  <span className="font-semibold not-italic text-ink-2">{bullet.lead}</span>
                )}
                {bullet.text}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {active ? (
        <div className="mt-10">
          {/* The `relative` box is scoped to the video + summary row only.
              It previously also wrapped the thumbnail strip below, so the
              arrows' `top-1/2` centred against video + summary + thumbnails
              combined — which read as noticeably below the video's centre. */}
          <div className="relative mx-auto max-w-7xl sm:px-16">
            {/* One prev/next pair spans the whole video+summary row — not
                per-side arrows — since moving to a different video always
                changes both columns together. Both wrap, so neither is ever
                disabled.

                They sit fully outside the row rather than straddling its
                edge: at `-translate-x-1/2` half the button overlapped the
                summary column and landed on the text. The row keeps a matching
                horizontal margin at the widths where the arrows are shown, so
                pushing them out cannot clip them off-screen. */}
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous video"
              className="absolute -left-14 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-white text-ink-2 shadow-sm transition-colors hover:border-brass hover:text-brass-deep sm:flex"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next video"
              className="absolute -right-14 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center border border-line bg-white text-ink-2 shadow-sm transition-colors hover:border-brass hover:text-brass-deep sm:flex"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>

            {/* Video is the wider column (7/12), summary the narrower (5/12).
                Testimonial/walkthrough clips: click-to-play (no autoplay),
                no download until the visitor presses play (preload="none" +
                poster), and the box keeps the clips' native 16:9 instead of
                cropping them into 4:3. */}
            <div className="grid gap-8 lg:grid-cols-12 lg:items-center lg:gap-8">
              <div className="lg:col-span-7">
                <div className="relative aspect-video overflow-hidden bg-ink">
                  <VideoPlayer
                    key={active.url}
                    src={active.url}
                    poster={active.poster}
                    label={active.speakerName || 'project video'}
                    onEnded={handleEnded}
                    className="h-full w-full"
                  />
                </div>
              </div>

              <div className="lg:col-span-5">
                {active.summary ? (
                  <div className="border-l-2 border-brass/60 pl-5">
                    <div className="text-sm leading-7 text-ink-2/75">
                      <RichTextContent data={active.summary} />
                    </div>
                    {active.speakerName ? (
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-brass-deep">
                        {active.speakerName}
                        {active.speakerRole ? ` — ${active.speakerRole}` : ''}
                      </p>
                    ) : null}

                    {/* Only when this clip is a project's video. The company
                        intro clip is not a project and gets no button. */}
                    {activeProjectHref ? (
                      <Link
                        href={activeProjectHref}
                        className="group mt-5 inline-flex items-center gap-2 border border-ink/25 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-ink-2 transition-colors hover:border-brass hover:text-brass-deep"
                      >
                        View this project
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1"
                          aria-hidden
                        />
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Thumbnail strip — makes it visible that this is a set of
              videos, not a single one, and lets someone jump straight to a
              specific project instead of arrowing through. Sits outside the
              `relative` box above so it can't affect arrow centring. */}
          {projectVideos.length > 1 ? (
            <div className="mx-auto mt-6 max-w-7xl">
              <p className="text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-2/50">
                More project videos
              </p>
              <div className="mt-3 flex flex-wrap items-stretch justify-center gap-4">
                {projectVideos.map((video, videoIndex) => {
                  const isActive = videoIndex === index
                  return (
                    <button
                      key={video.url}
                      type="button"
                      onClick={() => setIndex(videoIndex)}
                      aria-label={`Play video ${videoIndex + 1}${video.speakerName ? `: ${video.speakerName}` : ''}`}
                      aria-current={isActive}
                      className={cn(
                        'group relative w-32 overflow-hidden border transition-all sm:w-36',
                        isActive
                          ? 'border-brass opacity-100 ring-1 ring-brass'
                          : 'border-line opacity-70 hover:opacity-100',
                      )}
                    >
                      <span className="relative block aspect-video overflow-hidden bg-ink">
                        {video.poster ? (
                          <Image
                            src={video.poster}
                            alt=""
                            aria-hidden="true"
                            fill
                            className="object-cover"
                            sizes="144px"
                          />
                        ) : null}
                        <span
                          aria-hidden
                          className={cn(
                            'absolute inset-0 flex items-center justify-center transition-colors',
                            isActive ? 'bg-ink/20' : 'bg-ink/45 group-hover:bg-ink/25',
                          )}
                        >
                          <Play className="h-5 w-5 fill-white text-white" />
                        </span>
                      </span>
                      {/* {video.speakerName ? (
                        <span className="block truncate px-2 py-1.5 text-[11px] font-medium text-ink-2">
                          {video.speakerName}
                        </span>
                      ) : null} */}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </Section>
  )
}
