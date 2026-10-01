/**
 * Checks the hero CTA rule on the real pages: a pair sits on ONE line and
 * neither label wraps, from 360px up; below that it stacks.
 *
 * Line count comes from Range.getClientRects() over the button's own text
 * nodes, not from element height — a button with an explicit min-height is
 * taller than its content and a height-based estimate misreads that.
 */
import { chromium } from '@playwright/test'

const WIDTHS = [320, 360, 375, 390, 430, 639, 640, 700, 767, 768, 1024]
const PAGES = [
  '/services/kitchen-remodeling',
  '/services/bathroom-remodeling',
  '/services/home-remodeling',
  '/services/adu',
  '/services/complete-renovation',
  '/services/finance',
]

const browser = await chromium.launch({ channel: 'chrome' })
let problems = 0

for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: 900 } })
  console.log(`\n################ ${width}px`)

  for (const path of PAGES) {
    const res = await page.goto('http://localhost:3000' + path, {
      waitUntil: 'domcontentloaded',
      timeout: 120000,
    })
    if (!res || res.status() >= 400) continue
    await page.waitForTimeout(300)

    const hero = await page.evaluate(() => {
      const first = document.querySelector('section a[class*="group/btn"]')
      if (!first) return null
      const row = first.parentElement
      const btns = [...row.children].filter(
        (e) => typeof e.className === 'string' && e.className.includes('group/btn'),
      )

      const lineCount = (el) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
        let lines = 0
        let node
        while ((node = walker.nextNode())) {
          if (!node.textContent.trim()) continue
          const r = document.createRange()
          r.selectNodeContents(node)
          lines = Math.max(
            lines,
            new Set([...r.getClientRects()].map((x) => Math.round(x.top))).size,
          )
        }
        return Math.max(1, lines)
      }

      return btns.map((el) => {
        const r = el.getBoundingClientRect()
        const cs = getComputedStyle(el)
        return {
          label: el.textContent.trim().replace(/\s+/g, ' '),
          lines: lineCount(el),
          top: Math.round(r.top),
          w: Math.round(r.width),
          font: Math.round(parseFloat(cs.fontSize) * 10) / 10,
          overflow: Math.round(el.scrollWidth - el.clientWidth),
        }
      })
    })

    if (!hero || hero.length < 2) {
      console.log(`  --  ${path} (single hero button)`)
      continue
    }

    const sameRow = hero.every((b) => Math.abs(b.top - hero[0].top) < 6)
    const wraps = hero.some((b) => b.lines > 1)
    const overflows = hero.some((b) => b.overflow > 1)
    const wantSameRow = width >= 360

    const ok = !wraps && !overflows && sameRow === wantSameRow
    if (!ok) problems++
    console.log(
      `  ${ok ? 'ok ' : '!! '} ${path.replace('/services/', '').padEnd(21)} ` +
        `${sameRow ? 'one-line' : 'stacked '} font=${hero[0].font}px ` +
        `${wraps ? 'WRAPS ' : ''}${overflows ? 'OVERFLOWS ' : ''}` +
        hero.map((b) => `${b.label}(${b.w}px)`).join(' + '),
    )
  }
  await page.close()
}

console.log(`\n${problems === 0 ? 'PASS — hero pairs share one line from 360px, no wrap, no overflow' : problems + ' problem(s)'}`)
await browser.close()
