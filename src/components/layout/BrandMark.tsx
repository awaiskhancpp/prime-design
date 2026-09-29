import Image from '@/components/ui/Image'
import Link from 'next/link'

export function BrandMark({
  linked = true,
  forceReload = false,
}: {
  linked?: boolean
  /**
   * Render a plain `<a>` instead of `next/link`'s `<Link>`, forcing a full
   * page load on click rather than a client-side transition.
   *
   * Needed specifically on bare pages (service-location pages via
   * `ServiceLocationHeader`) that link back to "/". Reproduced bug without
   * this: click the logo on a service-location page, and the destination
   * "/" renders with TopBanner/SiteHeader/LandscapingCta/SiteFooter all
   * missing — confirmed (via a debug marker rendered by `template.tsx`
   * itself) that the *client* keeps displaying the previous page's stale
   * template output after the click, even though the server, re-invoked for
   * the new request, correctly recomputes non-bare chrome for "/" every
   * time. `template.tsx`'s own docs explain templates are supposed to force
   * a remount on navigation (unlike a persisting `layout.tsx`) precisely so
   * this kind of pathname-dependent branching can't go stale — but that
   * remount reliably happens on a real navigation, not on this client-side
   * one. Disabling `prefetch` on the `Link` did not help (still
   * reproduced), which rules out a prefetch-cache explanation and points at
   * the client router's segment cache reusing the template's previous
   * render outright. A plain `<a>` sidesteps the client router for this one
   * link, so the browser always requests "/" fresh — the one case (bare →
   * chromed) where losing the SPA transition is a reasonable trade.
   */
  forceReload?: boolean
}) {
  const logo = (
    <Image
      src="/Prime-Kitchens-Logo-300x176.png"
      alt="Prime Design & Build"
      width={112}
      height={82}
      priority
    />
  )

  if (!linked) {
    return (
      <span className="flex items-center gap-3" aria-label="Prime Design & Build">
        {logo}
      </span>
    )
  }

  if (forceReload) {
    return (
      <a href="/" className="flex items-center gap-3" aria-label="Prime Design & Build home">
        {logo}
      </a>
    )
  }

  return (
    <Link href="/" className="flex items-center gap-3" aria-label="Prime Design & Build home">
      {logo}
    </Link>
  )
}
