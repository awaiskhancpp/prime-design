'use client'

import { Maximize2, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

/**
 * The site's video player.
 *
 * Every `<video>` on the site used the browser's own `controls`, which is the
 * one piece of chrome no amount of CSS can reach: a grey rounded pill with a
 * system-font timecode and a kebab menu, sitting on top of brass-and-paper
 * photography. It also looks different in every browser.
 *
 * ── The design ────────────────────────────────────────────────────────────
 *
 * At rest the poster carries a brass plate with an offset hairline square
 * behind it. That pairing is the site's own motif — the same offset-frame
 * idea the hero and overview sections use — and on hover the plate slides
 * the two pixels into the frame, so the control answers the pointer without
 * resorting to a shadow or a colour change alone.
 *
 * Square, not a circle: everything on this site is `rounded-none`, from the
 * buttons to the city badges to the map cards. A round play button is the
 * default everyone else ships, and it would read as borrowed.
 *
 * Once it is playing the plate gets out of the way and a hairline bar rises
 * from the bottom edge, on `ink` at 85% with a blur behind it so a bright
 * frame cannot wash the controls out. The bar carries the full set the native
 * one did — play/pause, a scrubber, the time, mute and fullscreen — because
 * replacing `controls` with a play button alone would take away seeking and
 * volume, and that is a worse player, not a better-looking one.
 *
 * The bar hides itself while the video plays and comes back on hover, focus,
 * or whenever the video is paused, so it is never covering the picture during
 * a testimonial but is never more than a pointer-move away either.
 */
const format = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

export function VideoPlayer({
  src,
  poster,
  className,
  loop = false,
  label = 'Video',
  onEnded,
}: {
  src: string
  poster?: string
  /** The frame: aspect ratio, border and any surrounding treatment. */
  className?: string
  loop?: boolean
  /** Used for the control labels, so several players on a page stay distinct. */
  label?: string
  /** The homepage carousel advances to the next clip on this. */
  onEnded?: () => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  // `preload="none"` means the file is not fetched until someone asks for it,
  // so the gap between the click and the first frame is a whole download —
  // several seconds on a 40MB clip. Without this the plate vanished on click
  // and nothing took its place, which reads as a dead button.
  const [loading, setLoading] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const toggle = useCallback(() => {
    const el = video.current
    if (!el) return
    if (el.paused) {
      // Deliberately not `setStarted` here. `started` means playback has
      // actually begun, and it is what swaps the plate for the control bar —
      // setting it on the click is what hid the plate before there was
      // anything to show. The `playing` event below sets it.
      setLoading(true)
      void el.play()
    } else {
      el.pause()
    }
  }, [])

  // The element is the source of truth for play state, not the click handler:
  // it also pauses for reasons this component never hears about — the media
  // keys, picture-in-picture, another tab taking audio focus.
  useEffect(() => {
    const el = video.current
    if (!el) return
    // `play` fires the moment playback is requested; `playing` fires when
    // frames are actually moving. The difference between the two is exactly
    // the buffering window this spinner exists to cover, so `started` and
    // `loading` both hang off `playing`, never off `play`.
    const onPlay = () => setPlaying(true)
    const onPlaying = () => {
      setPlaying(true)
      setStarted(true)
      setLoading(false)
    }
    const onWaiting = () => setLoading(true)
    const onPause = () => {
      setPlaying(false)
      setLoading(false)
    }
    // A clip that 404s or cannot be decoded would otherwise spin for ever.
    const onError = () => setLoading(false)
    const onTime = () => setTime(el.currentTime)
    const onMeta = () => setDuration(el.duration)
    const onVolume = () => setMuted(el.muted)
    el.addEventListener('play', onPlay)
    el.addEventListener('playing', onPlaying)
    el.addEventListener('waiting', onWaiting)
    el.addEventListener('stalled', onWaiting)
    el.addEventListener('pause', onPause)
    el.addEventListener('error', onError)
    el.addEventListener('timeupdate', onTime)
    el.addEventListener('loadedmetadata', onMeta)
    el.addEventListener('volumechange', onVolume)
    return () => {
      el.removeEventListener('play', onPlay)
      el.removeEventListener('playing', onPlaying)
      el.removeEventListener('waiting', onWaiting)
      el.removeEventListener('stalled', onWaiting)
      el.removeEventListener('pause', onPause)
      el.removeEventListener('error', onError)
      el.removeEventListener('timeupdate', onTime)
      el.removeEventListener('loadedmetadata', onMeta)
      el.removeEventListener('volumechange', onVolume)
    }
  }, [])

  const seek = (value: number) => {
    const el = video.current
    if (el) {
      el.currentTime = value
      setTime(value)
    }
  }

  const progress = duration > 0 ? Math.min(100, (time / duration) * 100) : 0

  /*
    A square ring, not a disc. The plate it sits inside is square and so is
    everything else on this site; a circular throbber here would be the one
    round thing on the page.
  */
  const spinner = (size: string) => (
    <span
      aria-hidden
      className={cn('animate-spin border-2 border-white/30 border-t-white', size)}
    />
  )

  const iconButton =
    'flex h-8 w-8 shrink-0 items-center justify-center text-white/80 transition-colors hover:text-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass'

  return (
    <div className={cn('group relative overflow-hidden bg-ink', className)}>
      <video
        ref={video}
        className="h-full w-full object-cover"
        playsInline
        preload="none"
        loop={loop}
        poster={poster}
        onEnded={onEnded}
        onClick={() => started && toggle()}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* At rest — the poster is the picture, so the only thing over it is the
          one control a visitor is looking for. */}
      {!started ? (
        <button
          type="button"
          onClick={toggle}
          aria-label={loading ? `Loading ${label}` : `Play ${label}`}
          aria-busy={loading || undefined}
          className="absolute inset-0 flex items-center justify-center bg-ink/25 transition-colors duration-300 hover:bg-ink/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brass"
        >
          <span className="relative block h-16 w-16 sm:h-[72px] sm:w-[72px]">
            {/* The offset frame. The plate below closes the gap on hover. */}
            
            <span
              aria-hidden
              className={cn(
                'absolute inset-0 flex items-center justify-center bg-brass text-white transition-all duration-300 ease-out',
                !loading &&
                  'group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:bg-brass-deep',
              )}
            >
              {loading ? (
                spinner('h-6 w-6 sm:h-7 sm:w-7')
              ) : (
                /* Nudged right so the triangle looks centred: its optical
                   centre sits left of its bounding box. */
                <Play className="ml-0.5 h-6 w-6 fill-current sm:h-7 sm:w-7" />
              )}
            </span>
          </span>
        </button>
      ) : null}

      {started && loading ? (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/20">
          {spinner('h-9 w-9')}
        </span>
      ) : null}

      {/* A hairline that sweeps while the clip is buffering. It reads from
          across the section, which a 24px spinner inside a plate does not —
          and it is the same hairline vocabulary the rest of the site uses. */}
      {loading ? (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden bg-white/20"
        >
          <span className="block h-full w-1/4 animate-buffer-sweep bg-brass" />
        </span>
      ) : null}

      {/* The bar. Present from the first play, hidden while the picture is
          moving unless the pointer or keyboard is on it. */}
      {started ? (
        <div
          className={cn(
            'absolute inset-x-0 bottom-0 flex items-center gap-3 border-t border-white/15 bg-ink/85 px-3 py-2 backdrop-blur-sm transition-opacity duration-300',
            playing
              ? 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              : 'opacity-100',
          )}
        >
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? `Pause ${label}` : `Play ${label}`}
            className={iconButton}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-current" aria-hidden />
            ) : (
              <Play className="ml-0.5 h-4 w-4 fill-current" aria-hidden />
            )}
          </button>

          {/* A real range input: draggable, arrow-key seekable and announced
              as a slider, which a div with a click handler is none of. */}
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={Math.min(time, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label={`Seek ${label}`}
            /*
              `accent-color` paints the thumb but leaves the track one flat
              colour in most browsers, so the played portion is drawn here as a
              hard-stopped gradient instead. It is the only way to show
              progress on a native range input without replacing it with divs
              and losing the keyboard and screen-reader behaviour that comes
              free with it.
            */
            style={{
              background: `linear-gradient(to right, var(--color-brass) ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
            }}
            className="h-1 min-w-0 flex-1 cursor-pointer appearance-none accent-brass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brass"
          />

          <span className="shrink-0 text-[11px] font-medium tabular-nums tracking-wide text-white/70">
            {format(time)} / {format(duration)}
          </span>

          <button
            type="button"
            onClick={() => {
              const el = video.current
              if (el) el.muted = !el.muted
            }}
            aria-label={muted ? `Unmute ${label}` : `Mute ${label}`}
            className={iconButton}
          >
            {muted ? (
              <VolumeX className="h-4 w-4" aria-hidden />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden />
            )}
          </button>

          <button
            type="button"
            onClick={() => void video.current?.requestFullscreen?.()}
            aria-label={`Full screen ${label}`}
            className={iconButton}
          >
            <Maximize2 className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  )
}
