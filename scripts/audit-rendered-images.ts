import { chromium } from '@playwright/test'

const baseUrl = (process.env.AUDIT_BASE_URL || 'http://localhost:3000').replace(/\/$/, '')
const timeoutMs = 20_000
const concurrency = Number(process.env.AUDIT_CONCURRENCY || 6)

type ImageFinding = {
  page: string
  image: string
  reason: string
}

const localize = (value: string) => {
  try {
    const url = new URL(value)
    return `${baseUrl}${url.pathname}${url.search}`
  } catch {
    return value.startsWith('/') ? `${baseUrl}${value}` : value
  }
}

const browser = await chromium.launch({
  headless: true,
  // Reuse an installed Chrome when Playwright's managed browser is absent.
  executablePath: process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
})
const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`)
if (!sitemapResponse.ok) throw new Error(`Could not read sitemap: HTTP ${sitemapResponse.status}`)
const sitemap = await sitemapResponse.text()
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => localize(match[1]))

const findings: ImageFinding[] = []
let pageErrors = 0
let imageCount = 0

try {
  let nextPage = 0
  const auditPage = async (pageUrl: string) => {
    const page = await browser.newPage()
    const failedResponses: ImageFinding[] = []
    page.on('response', (response) => {
      if (response.request().resourceType() !== 'image') return
      if (response.status() >= 400) {
        failedResponses.push({
          page: pageUrl,
          image: response.url(),
          reason: `browser request returned HTTP ${response.status()}`,
        })
      }
    })

    try {
      await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: timeoutMs })
      await page.evaluate(async () => {
        const step = Math.max(window.innerHeight, 1)
        for (let y = 0; y < document.body.scrollHeight; y += step) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(250)

      const images = await page.locator('img').evaluateAll((nodes) =>
        nodes.map((node) => {
          const image = node as HTMLImageElement
          return {
            src: image.currentSrc || image.src,
            complete: image.complete,
            naturalWidth: image.naturalWidth,
            naturalHeight: image.naturalHeight,
          }
        }),
      )
      imageCount += images.length
      for (const image of images) {
        if (!image.src) continue
        // `complete === false` is normal for lazy-loaded images that are not
        // in the viewport. Only a completed request with zero dimensions is a
        // confirmed broken image.
        if (image.complete && (image.naturalWidth === 0 || image.naturalHeight === 0)) {
          findings.push({
            page: pageUrl,
            image: image.src,
            reason: `browser loaded zero dimensions (${image.naturalWidth}×${image.naturalHeight})`,
          })
        }
      }
      findings.push(...failedResponses)
    } catch (error) {
      pageErrors++
      console.log(`[page-error] ${pageUrl}: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      await page.close()
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, pages.length) }, async () => {
    while (true) {
      const index = nextPage++
      if (index >= pages.length) return
      await auditPage(pages[index])
    }
  })
  await Promise.all(workers)
} finally {
  await browser.close()
}

const uniqueFindings = [...new Map(findings.map((finding) => [`${finding.page}|${finding.image}|${finding.reason}`, finding])).values()]
console.log(`Pages crawled: ${pages.length}`)
console.log(`Rendered <img> elements seen: ${imageCount}`)
console.log(`Page errors: ${pageErrors}`)
console.log(`Confirmed image-load findings: ${uniqueFindings.length}`)
for (const finding of uniqueFindings) {
  console.log(`  [confirmed] ${finding.reason}`)
  console.log(`    page:  ${finding.page}`)
  console.log(`    image: ${finding.image}`)
}
