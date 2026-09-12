'use client'

import { useEffect, useState } from 'react'

import { Section } from '@/components/ui/Section'
import { HighlightedText } from '@/components/ui/HighlightedText'
import type { HomepageDifference } from '@/lib/homepage'
import type { SiteSettingsValue } from '@/lib/siteSettings'
import { cn } from '@/lib/utils'
import { Check } from 'lucide-react'
import Image from 'next/image'

/**
 * The CDN hosting the project videos sends no CORS headers, so the frames
 * are captured through our own same-origin `/api/video-proxy` — the browser
 * fetches the range it needs, then draws that frame onto a canvas and uses
 * the resulting JPEG as the thumbnail poster.
 */
const posterSrc = (url: string) => `/api/video-proxy?url=${encodeURIComponent(url)}`

/**
 * WordPress ships no poster images for these five videos (the Bricks video
 * elements have no `poster` set), so the thumbnail has to come from the
 * video itself. Two things made the naive capture come out black: with
 * `preload="metadata"` the browser never decodes a paintable frame, and the
 * first seconds are a shared white/black intro card, so every tile ended up
 * looking identical. A frame 15% in lands on that project's own footage.
 */
const POSTER_FRACTION = 0.15

/** Media-fragment time for the instant fallback frame, before the capture. */
const POSTER_FALLBACK_SECONDS = 10

function VideoPoster({ src, alt }: { src: string; alt: string }) {
  const [poster, setPoster] = useState<string | null>(null)

  useEffect(() => {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.preload = 'auto'
    video.src = src

    let captured = false
    const cleanup = () => {
      video.onloadedmetadata = null
      video.onseeked = null
      video.onerror = null
      video.removeAttribute('src')
      video.load()
    }

    video.onloadedmetadata = () => {
      const duration =
        Number.isFinite(video.duration) && video.duration > 0
          ? video.duration
          : POSTER_FALLBACK_SECONDS * 2
      video.currentTime = Math.max(0, Math.min(duration * POSTER_FRACTION, duration - 0.5))
    }

    video.onseeked = () => {
      if (captured) return
      captured = true
      try {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 360
        const context = canvas.getContext('2d')
        if (context) {
          context.drawImage(video, 0, 0, canvas.width, canvas.height)
          setPoster(canvas.toDataURL('image/jpeg', 0.72))
        }
      } catch {
        // Tainted canvas — keep the frame video fallback below.
      }
      cleanup()
    }
    video.onerror = cleanup

    return cleanup
  }, [src])

  if (poster) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={poster}
        alt={alt}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
      />
    )
  }

  // Until the frame is captured, show the video's own frame at the fallback time.
  return (
    <span className="pointer-events-none absolute inset-0 bg-ink" aria-hidden="true">
      <video
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="auto"
        tabIndex={-1}
      >
        <source src={`${src}#t=${POSTER_FALLBACK_SECONDS}`} type="video/mp4" />
      </video>
    </span>
  )
}

const bullets = [
  { lead: '', text: 'Experts on-site for interior design' },
  { lead: '', text: 'Certified general contractor, fully licensed' },
  { lead: 'Family-owned', text: ' and operated business' },
  { lead: 'Competitive', text: ' pricing for our services' },
  { lead: 'Quick response', text: ' for customer satisfaction' },
]

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

const projectVideos = [
  {
    title: 'Noah, Co-Owner',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Vid%20Noah.mp4',
  },
  {
    title: 'Rosewood Dr, Atherton',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/03.09.2024%20Noam%20Prime%2041%20Rosewood%20Dr%20Atherton.mp4',
  },
  {
    title: 'Alice Ave, Mountain View',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/09.04.2024%20Ilay%20Prime%20Kitchen%20700%20Alice%20Ave%20Mountain%20View.mp4',
  },
  {
    title: 'Bluebonnet Ct, Morgan Hill',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/07.18.2024%20Josef%20Prime%20Full%20House%201840%20Bluebonnet%20Ct%20Morgan%20Hill.mp4',
  },
  {
    title: 'First floor renovation',
    url: 'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/First%20Floor.mp4',
  },
]

export function LandscapingDifference({
  difference,
  socialLinks,
}: {
  difference?: HomepageDifference
  /** Review-profile URLs from Site Settings (Google / Yelp / Houzz / BBB). */
  socialLinks?: SiteSettingsValue['socialLinks']
}) {
  const [active, setActive] = useState(projectVideos[0])

  const statLine = difference?.eyebrow || 'Over 350+ Projects in Silicon Valley'
  const heading = difference?.heading || 'The Prime Difference'
  const checklist = difference?.checklist?.length ? difference.checklist : bullets

  return (
    <Section className="">
      <div className="mb-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
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
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden bg-ink">
            <video
              key={active.url}
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="metadata"
            >
              <source src={active.url} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="order-1 lg:order-2 mt-3 grid grid-cols-5 gap-2">
            {projectVideos.map((video) => (
              <button
                key={video.url}
                type="button"
                onClick={() => setActive(video)}
                aria-label={`Play video: ${video.title}`}
                aria-pressed={active.url === video.url}
                className={cn(
                  'relative aspect-video overflow-hidden border-2 transition-colors',
                  active.url === video.url
                    ? 'border-brass'
                    : 'border-transparent hover:border-line',
                )}
              >
                <VideoPoster src={posterSrc(video.url)} alt={video.title} />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brass-deep">
            {statLine}
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-tight text-ink-2 md:text-4xl">
            <HighlightedText text={heading} highlight={difference?.headingHighlight} />
          </h2>

          <ul className="mt-8 space-y-4">
            {checklist.map((bullet) => (
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
