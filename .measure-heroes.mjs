/**
 * Measures every page hero: how far past the viewport it runs once the
 * TopBanner is accounted for, and how much copy it is carrying.
 */
import { chromium } from '@playwright/test'

const WIDTHS = [
  { w: 390, h: 844, name: 'phone' },
  { w: 768, h: 1024, name: 'tablet' },
  { w: 1440, h: 900, name: 'desktop' },
]
const PAGES = [
  '/',
  '/about',
  '/services',
  '/services/kitchen-remodeling',
  '/services/comprehensive-home-repair-installation-services-in-silicon-valley',
  '/services/home-remodeling',
  '/services/finance',
  '/our-projects',
  '/contact',
  '/faq',
  '/gallery',
  '/testimonials',
  '/blog',
  '/privacy-policy',
  '/thank-you',
]

const browser = await chromium.launch({ channel: 'chrome' })

for (const vp of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: vp.w, height: vp.h } })
  console.log(`\n######## ${vp.name} ${vp.w}x${vp.h}`)

  for (const path of PAGES) {
    const res = await page.goto('http://localhost:3000' + path, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
    if (!res || res.status() >= 400) {
      console.log(`  --  ${path} (${res ? res.status() : 'no response'})`)
      continue
    }
    await page.waitForTimeout(400)

    const m = await page.evaluate(() => {
      const banner = document.querySelector('aside[aria-label="Contact details"]')
      const bannerH = banner ? Math.round(banner.getBoundingClientRect().height) : 0

      // The hero is the first tall section after the chrome.
      const hero =
        document.querySelector('section.min-h-screen') ||
        document.querySelector('main > section, main > div > section, body section')
      if (!hero) return { bannerH, hero: null }

      const r = hero.getBoundingClientRect()
      const heading = hero.querySelector('h1')
      const paras = [...hero.querySelectorAll('p')]
        .map((p) => p.textContent.trim())
        .filter(Boolean)

      return {
        bannerH,
        heroTop: Math.round(r.top + window.scrollY),
        heroH: Math.round(r.height),
        heroBottom: Math.round(r.bottom + window.scrollY),
        vh: window.innerHeight,
        headingChars: heading ? heading.textContent.trim().length : 0,
        headingLines: heading
          ? Math.round(
              heading.getBoundingClientRect().height /
                parseFloat(getComputedStyle(heading).lineHeight),
            )
          : 0,
        bodyChars: paras.join(' ').length,
        cls: hero.className.slice(0, 40),
      }
    })

    if (!m.hero && m.heroH === undefined) {
      console.log(`  --  ${path} (no hero found)`)
      continue
    }

    const past = m.heroBottom - m.vh
    const flag = past > 4 ? `OVER by ${past}px` : past < -4 ? `short ${-past}px` : 'exact'
    console.log(
      `  ${past > 4 ? '!!' : 'ok'}  ${path.slice(0, 46).padEnd(47)} ` +
        `banner=${String(m.bannerH).padStart(3)} hero=${String(m.heroH).padStart(4)} ` +
        `vh=${m.vh} ${flag.padEnd(14)} h1=${m.headingChars}ch/${m.headingLines}ln body=${m.bodyChars}ch`,
    )
  }
  await page.close()
}

await browser.close()
