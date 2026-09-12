/**
 * Decorative site-chrome imagery.
 *
 * The WordPress footer template (id 78) paints its "Silicon Valley's Luxury
 * Home Contractor" band with attachment 3645 (`973-rafi-rocks-hero.png`, a
 * soft flowing wave). The CTA band and the footer share it so the two
 * sections read as one continuous wave instead of two flat navy blocks.
 *
 * Imported from WordPress into the Payload media library (media 548); move
 * it to Site Settings if editors ever need to swap it.
 */
export const WAVE_BACKGROUND = '/api/media/file/973-rafi-rocks-hero.png'

/**
 * Homepage hero video.
 *
 * WordPress paints the hero with TWO files (homepage section `7aeae0`): a
 * high-bitrate 3840×2160 desktop clip in `_background.videoUrl`, and a 3 MB
 * mobile cut in `_background:mobile_portrait.videoUrl` that WordPress swaps
 * in below the tablet breakpoint. Only the mobile cut was migrated into
 * Payload (media 447), so it played on desktop too and the hero looked soft.
 * Both stay hot-linked from the CDN WordPress used — the desktop clip alone
 * is ~67 MB and would eat the Blob quota for no benefit.
 */
export const HERO_VIDEO_DESKTOP =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Prime%20Design%20Updated%20Home%20Video.mp4'

/** The light mobile cut — same file as Payload media 447. */
export const HERO_VIDEO_MOBILE =
  'https://tagmediaspace.b-cdn.net/Prime%20Design%20and%20Build/Home-Video-Updated.mp4'
