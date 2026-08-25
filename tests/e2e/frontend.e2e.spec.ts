import { expect, test } from '@playwright/test'

test.describe('Frontend', () => {
  test('can go on homepage', async ({ page }) => {
    await page.goto('http://localhost:3000/landscaping')

    await expect(page).toHaveTitle(/Landscaping & Outdoor Living/)
    await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Outside should feel like part of home.' })).toBeVisible()
    await expect(page.getByText('Serving homeowners across')).toBeVisible()

    await expect(page.getByRole('link', { name: 'Plan your space' })).toHaveAttribute('href', '/contact')
  })
})
