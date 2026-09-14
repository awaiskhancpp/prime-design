import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const checks = {
  '/': ['Top-rated', 'The Prime Difference', 'Our Latest Remodeling Projects', 'Our Services', 'Contact our team today!', 'Areas we service'],
  '/about': ['The Go-To Choice', 'Meet our exceptional Team', 'Reliability in Every Project', 'Our Core Values', 'This is why our customers love us!', 'Frequently Asked Questions'],
  '/gallery': ['A reflection of our remodeling projects', 'Why choose Prime Design & Build?', 'Ready to discuss', 'Areas we service'],
  '/blog': ['See our blog'],
}
for (const [path, needles] of Object.entries(checks)) {
  const res = await page.goto('http://localhost:3000' + path, { waitUntil: 'domcontentloaded', timeout: 180000 })
  await page.waitForTimeout(4500)
  const text = await page.evaluate(() => document.body.innerText)
  const missing = needles.filter((n) => !text.includes(n))
  const sections = await page.evaluate(() => document.querySelectorAll('section').length)
  const tabs = await page.evaluate(() => [...document.querySelectorAll('[role="tab"]')].map((t) => t.textContent?.trim()).join(', '))
  console.log(`${path} [${res?.status()}] ${sections} sections — ${missing.length ? 'MISSING: ' + missing.join(' | ') : 'ok'}${tabs ? ' — tabs: ' + tabs : ''}`)
}
const videos = await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(3000)
const hero = await page.evaluate(() => {
  const v = document.querySelector('video')
  return { currentSrc: v?.currentSrc, w: v?.videoWidth, h: v?.videoHeight }
})
console.log('home hero video:', JSON.stringify(hero))
await browser.close()
