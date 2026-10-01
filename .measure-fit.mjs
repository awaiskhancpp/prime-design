/**
 * Collects the REAL hero CTA labels from every service page, then measures
 * each at candidate mobile type settings against the space a half-width
 * button actually has. Uses the page's own font via canvas measureText.
 */
import { chromium } from '@playwright/test'

const PAGES = [
  '/services/kitchen-remodeling',
  '/services/bathroom-remodeling',
  '/services/home-remodeling',
  '/services/adu',
  '/services/complete-renovation',
  '/services/siding',
  '/services/additions',
  '/services/outdoor-hardscape',
  '/services/finance',
]

const browser = await chromium.launch({ channel: 'chrome' })
const page = await browser.newPage({ viewport: { width: 390, height: 900 } })

// --- collect the hero rows -------------------------------------------------
const heroes = []
for (const path of PAGES) {
  const res = await page.goto('http://localhost:3000' + path, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  })
  if (!res || res.status() >= 400) {
    console.log(`  (skip ${path} — ${res ? res.status() : 'no response'})`)
    continue
  }
  await page.waitForTimeout(300)
  const labels = await page.evaluate(() => {
    const row = document.querySelector('section a[class*="group/btn"]')?.parentElement
    if (!row) return []
    return [...row.children]
      .filter((e) => typeof e.className === 'string' && e.className.includes('group/btn'))
      .map((e) => e.textContent.trim().replace(/\s+/g, ' '))
  })
  heroes.push({ path, labels })
}

console.log('\n=== hero button rows ===')
for (const h of heroes) console.log(`  ${h.path.padEnd(36)} ${JSON.stringify(h.labels)}`)

const pairs = heroes.filter((h) => h.labels.length > 1)
const allPairLabels = [...new Set(pairs.flatMap((h) => h.labels))]

// --- measure ---------------------------------------------------------------
const CANDIDATES = [
  { px: 11, track: 0.02, pad: 10 },
  { px: 10.5, track: 0.02, pad: 10 },
  { px: 10, track: 0.02, pad: 10 },
]
const VIEWPORTS = [320, 360, 390, 430]

const widths = await page.evaluate(
  ({ allPairLabels, CANDIDATES }) => {
    const btn = [...document.querySelectorAll('a')].find(
      (e) => typeof e.className === 'string' && e.className.includes('group/btn'),
    )
    const cs = getComputedStyle(btn)
    const ctx = document.createElement('canvas').getContext('2d')
    const out = {}
    for (const c of CANDIDATES) {
      ctx.font = `${cs.fontWeight} ${c.px}px ${cs.fontFamily}`
      out[c.px] = Object.fromEntries(
        allPairLabels.map((l) => {
          const up = l.toUpperCase()
          return [l, Math.ceil(ctx.measureText(up).width + up.length * c.track * c.px)]
        }),
      )
    }
    return out
  },
  { allPairLabels, CANDIDATES },
)

console.log('\n=== fit of every PAIRED hero label (no arrow on mobile) ===')
for (const c of CANDIDATES) {
  console.log(`\n--- ${c.px}px / ${c.track}em / ${c.pad}px padding ---`)
  for (const vp of VIEWPORTS) {
    const half = Math.floor((vp - 32 - 8) / 2)
    const inner = half - c.pad * 2 - 2
    const over = allPairLabels.filter((l) => widths[c.px][l] > inner)
    console.log(
      `  ${vp}px → inner ${inner}px :: ${over.length ? 'OVER → ' + over.map((l) => `${l} (${widths[c.px][l]})`).join(', ') : 'all fit'}`,
    )
  }
}

await browser.close()
