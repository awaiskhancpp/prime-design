import { resolveAnalytics } from '@/lib/trackingResolve'

/**
 * Emits the site's analytics, advertising, and call-tracking tags.
 *
 * Rendered once in the frontend root layout, inside `<head>`.
 *
 * ## Why plain `<script>` rather than `next/script`
 *
 * `next/script`'s `beforeInteractive` strategy is the only one that executes
 * its scripts in the order they are declared, and this file depends on order:
 * `window.dataLayer` has to exist before `gtag()` is called, and GTM has to
 * load before the direct tags so its container can see the page. But that
 * strategy is only honoured in the **root layout**, and this app has no
 * `src/app/layout.tsx` — `(frontend)` and `(payload)` are sibling route groups
 * with a layout each, so the frontend shell is not a root layout and
 * `beforeInteractive` would be dropped.
 *
 * A plain inline `<script>` in a server component is emitted into the initial
 * HTML in document order, which is exactly the guarantee needed here, and it
 * does not add the client component boundary `next/script` would.
 *
 * ## Order
 *
 * 1. GTM container (if configured) — loads first so its container owns the page.
 * 2. The data layer, `gtag()` shim, and the Google tag.
 * 3. Meta Pixel and Clarity.
 * 4. Any custom head code, last.
 *
 * Nimbata is not here: the vendor requires its tag near `</body>`, so it is
 * emitted by `AnalyticsBodyEnd` instead.
 *
 * Every platform is skipped when its ID is blank, so an unconfigured field
 * emits nothing rather than an empty tag.
 */
export async function AnalyticsScripts() {
  const analytics = await resolveAnalytics()
  const { googleTagManagerId, googleTagId, googleAnalyticsId, googleAdsId, metaPixelId } = analytics
  const { clarityProjectId, custom } = analytics

  const googleTag = googleTagId || googleAdsId

  /**
   * The Google tag is loaded once, with the first configured ID, and any
   * additional IDs are attached with `gtag('config', …)`. Google documents
   * this as the way to serve several destinations from one tag; loading
   * `gtag/js` twice would double-initialise the data layer.
   */
  const googleConfigIds = [googleTagId, googleAnalyticsId, googleAdsId].filter(Boolean) as string[]

  return (
    <>
      {googleTagManagerId ? (
        /*
         * Deliberate deviation: @next/third-parties' GoogleTagManager is not
         * installed, and it injects with `afterInteractive`, which gives no
         * ordering guarantee. The data layer must exist before gtag() is
         * called, so the inline snippet is the correct choice here.
         */
        // eslint-disable-next-line @next/next/next-script-for-ga
        <script
          id="gtm-container"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(googleTagManagerId)});`,
          }}
        />
      ) : null}

      {googleTag ? (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTag)}`} />
          <script
            id="gtag-init"
            dangerouslySetInnerHTML={{
              __html: [
                'window.dataLayer = window.dataLayer || [];',
                'function gtag(){dataLayer.push(arguments);}',
                "gtag('js', new Date());",
                ...googleConfigIds.map((id) => `gtag('config', ${JSON.stringify(id)});`),
              ].join('\n'),
            }}
          />
        </>
      ) : null}

      {metaPixelId ? (
        <script
          id="meta-pixel"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', ${JSON.stringify(metaPixelId)});fbq('track', 'PageView');`,
          }}
        />
      ) : null}

      {clarityProjectId ? (
        <script
          id="ms-clarity"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarityProjectId)});`,
          }}
        />
      ) : null}

      {custom?.headCode ? (
        <script id="custom-head-code" dangerouslySetInnerHTML={{ __html: custom.headCode }} />
      ) : null}
    </>
  )
}

/**
 * The `<noscript>` half of the Google Tag Manager installation.
 *
 * Rendered at the top of `<body>`; without it the GTM install is incomplete
 * and visits from browsers with JavaScript disabled are never counted.
 */
export async function AnalyticsBodyStart() {
  const { googleTagManagerId, custom } = await resolveAnalytics()

  return (
    <>
      {googleTagManagerId ? (
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<iframe src="https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(googleTagManagerId)}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`,
          }}
        />
      ) : null}
      {custom?.bodyStartCode ? (
        <div dangerouslySetInnerHTML={{ __html: custom.bodyStartCode }} />
      ) : null}
    </>
  )
}

/**
 * Scripts that belong at the end of `<body>`, after the page content.
 *
 * Nimbata's dynamic number insertion is placed here because that is where the
 * vendor requires it — their installation guide is explicit that the tag goes
 * "as the last item just before the `</body>` section on every page", and that
 * it must load after Google Analytics. It is emitted verbatim rather than
 * rebuilt from an ID: the identifier Nimbata publishes is not the same value
 * as the tracking phone number, and their host is not reachable from this
 * environment to confirm a constructed URL.
 */
export async function AnalyticsBodyEnd() {
  const { custom, nimbataScript } = await resolveAnalytics()

  if (!custom?.bodyEndCode && !nimbataScript) return null

  return (
    <>
      {nimbataScript ? (
        <div id="nimbata-script" dangerouslySetInnerHTML={{ __html: nimbataScript }} />
      ) : null}
      {custom?.bodyEndCode ? (
        <div dangerouslySetInnerHTML={{ __html: custom.bodyEndCode }} />
      ) : null}
    </>
  )
}
