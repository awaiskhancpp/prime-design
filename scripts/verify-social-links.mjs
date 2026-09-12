import { chromium } from '@playwright/test'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 120000 })

const links = await page.$$eval('img', (imgs) =>
  imgs
    .filter((img) => decodeURIComponent(img.getAttribute('src') || '').includes('/social/'))
    .map((img) => {
      const a = img.closest('a')
      const rect = img.getBoundingClientRect()
      return {
        file: decodeURIComponent(img.getAttribute('src') || '').split('url=')[1]?.split('&')[0],
        href: a?.getAttribute('href') ?? null,
        target: a?.getAttribute('target') ?? null,
        rel: a?.getAttribute('rel') ?? null,
        ariaLabel: a?.getAttribute('aria-label') ?? null,
        natural: `${img.naturalWidth}x${img.naturalHeight}`,
        rendered: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
        naturalRatio: +(img.naturalWidth / img.naturalHeight).toFixed(3),
        renderedRatio: +(rect.width / rect.height).toFixed(3),
      }
    }),
)

console.log('badge count:', links.length)
for (const l of links) {
  const drift = Math.abs(l.naturalRatio - l.renderedRatio)
  console.log(
    `${l.file}\n   href=${l.href}\n   target=${l.target} rel=${l.rel} aria="${l.ariaLabel}"\n   natural=${l.natural} rendered=${l.rendered} ratio=${l.naturalRatio} vs ${l.renderedRatio} drift=${drift.toFixed(3)}${drift > 0.02 ? '  <-- STRETCHED' : '  ok'}`,
  )
}
await browser.close()
