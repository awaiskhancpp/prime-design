import { chromium } from '@playwright/test'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 120000 })

// Wait for the thumbnail posters to be captured (data: JPEG images).
const posters = await page.waitForFunction(
  () => document.querySelectorAll('img[src^="data:image/jpeg"]').length >= 5,
  null,
  { timeout: 90000 },
).then(() => true).catch(() => false)

const report = await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll('img[src^="data:image/jpeg"]')]
  const brightnessOf = (img) =>
    new Promise((resolve) => {
      const probe = new Image()
      probe.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 64
        canvas.height = 36
        const ctx = canvas.getContext('2d')
        ctx.drawImage(probe, 0, 0, canvas.width, canvas.height)
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
        let sum = 0
        for (let i = 0; i < data.length; i += 4) sum += (data[i] + data[i + 1] + data[i + 2]) / 3
        resolve({ brightness: Math.round(sum / (data.length / 4)), breadth: probe.naturalWidth + 'x' + probe.naturalHeight })
      }
      probe.onerror = () => resolve({ brightness: 'decode error' })
      probe.src = img.src
    })
  const out = []
  for (const img of imgs) out.push({ alt: img.alt, ...(await brightnessOf(img)) })
  return { count: imgs.length, tiles: out }
})

console.log('posters captured:', posters)
console.log(JSON.stringify(report, null, 1))
await browser.close()
