import { chromium } from '@playwright/test'
const browser = await chromium.launch({ channel: 'chrome', headless: true })
for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
  const page = await browser.newPage({ viewport })
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 120000 })
  await page.waitForTimeout(7000)
  const info = await page.evaluate(() => {
    const v = document.querySelector('video')
    const sources = [...(v?.querySelectorAll('source') ?? [])].map((s) => ({ src: s.getAttribute('src'), media: s.getAttribute('media') }))
    return {
      sources,
      currentSrc: v?.currentSrc,
      readyState: v?.readyState,
      networkState: v?.networkState,
      videoWidth: v?.videoWidth,
      videoHeight: v?.videoHeight,
      duration: v?.duration,
      error: v?.error ? { code: v.error.code, message: v.error.message } : null,
    }
  })
  console.log(`--- ${label} ---`)
  console.log(JSON.stringify(info, null, 1))
  await page.close()
}
await browser.close()
