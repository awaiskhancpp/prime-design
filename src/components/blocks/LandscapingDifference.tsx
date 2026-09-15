'use client'

import { useState } from 'react'

import { Section } from '@/components/ui/Section'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { PageDifferenceContent } from '@/lib/pageSections'
import { RichTextContent } from '@/components/rich-text/RichTextContent'
import type { SiteSettingsValue } from '@/lib/siteSettings'
import { cn } from '@/lib/utils'
import { Check, ChevronLeft, ChevronRight, Play } from 'lucide-react'
import Image from 'next/image'

/**
 * WordPress homepage review badges (Bricks image elements whose `link` is the
 * matching ACF option: `{acf_yelp}`, `{acf_google_business_link}`,
 * `{acf_houzz}`, `{acf_bbb}`). The URLs come from Site Settings; the `key`
 * maps each badge to its link field. `width`/`height` are each file's real
 * pixel size — the row is sized by height so nothing gets squashed.
 */
const socialBadges = [
  { key: 'yelp', image: '/social/Yelp.png', label: 'Yelp reviews', width: 300, height: 158 },
  {
    key: 'googleBusiness',
    image: '/social/Google.png',
    label: 'Google reviews',
    width: 300,
    height: 158,
  },
  { key: 'houzz', image: '/social/houzz.png', label: 'Houzz profile', width: 300, height: 158 },
  {
    key: 'bbb',
    image: '/social/BB-ACCREDITED.jpeg',
    label: 'Better Business Bureau accredited business',
    width: 300,
    height: 114,
  },
] as const

export function LandscapingDifference({
  difference,
  socialLinks,
}: {
  difference?: PageDifferenceContent
  /** Review-profile URLs from Site Settings (Google / Yelp / Houzz / BBB). */
  socialLinks?: SiteSettingsValue['socialLinks']
}) {
  // The project videos come from the section's `videos` array in Payload.
  const projectVideos = difference?.videos?.length ? difference.videos : []

  const [index, setIndex] = useState(0)
  const active = projectVideos[index]
  const canGoPrev = index > 0
  const canGoNext = index < projectVideos.length - 1

  // Bounded, not infinite: clamped, never wraps past either end — same rule
  // for the manual arrows and for auto-advance on a video ending.
  function goPrev() {
    setIndex((current) => Math.max(0, current - 1))
  }
  function goNext() {
    setIndex((current) => Math.min(projectVideos.length - 1, current + 1))
  }
  function handleEnded() {
    if (canGoNext) goNext()
    // On the last video, it just ends — no loop back to the first.
  }

  const statLine = difference?.eyebrow
  const heading = difference?.heading ?? ''
  const checklist = difference?.checklist ?? []

  return (
    <Section className="">
      <div className="mb-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
        {socialBadges.map((badge) => {
          const href = socialLinks?.[badge.key]
          const image = (
            <Image
              src={badge.image}
              alt=""
              aria-hidden="true"
              width={badge.width}
              height={badge.height}
              className="h-12 w-auto object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100 sm:h-14"
            />
          )

          return href ? (
            <a
              key={badge.key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${badge.label} (opens in a new tab)`}
              className="group inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass focus-visible:ring-offset-4"
            >
              {image}
            </a>
          ) : (
            <span key={badge.key} className="group inline-flex items-center justify-center">
              {image}
            </span>
          )
        })}
      </div>

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
          <div className="relative mx-auto max-w-7xl">
            {/* One prev/next pair spans the whole video+summary row — not
                per-side arrows — since moving to a different video always
                changes both columns together. Click-to-play with
                auto-advance on end is the way through the set; the arrows
                are the manual override, and neither one wraps past either
                end. */}
            <button
              type="button"
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous video"
              className={cn(
                'absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center border bg-white text-ink-2 shadow-sm transition-colors',
                canGoPrev
                  ? 'border-line hover:border-brass hover:text-brass-deep'
                  : 'cursor-not-allowed border-line/50 text-ink-2/30',
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next video"
              className={cn(
                'absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 translate-x-1/2 items-center justify-center border bg-white text-ink-2 shadow-sm transition-colors',
                canGoNext
                  ? 'border-line hover:border-brass hover:text-brass-deep'
                  : 'cursor-not-allowed border-line/50 text-ink-2/30',
              )}
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
                  <video
                    key={active.url}
                    className="h-full w-full object-cover"
                    controls
                    playsInline
                    preload="none"
                    poster={active.poster}
                    onEnded={handleEnded}
                  >
                    <source src={active.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
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
