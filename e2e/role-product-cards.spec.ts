import { expect, test } from '@playwright/test'
import { signInDemoUser, waitForAppReady } from './helpers'

test.describe('role product cards', () => {
  test('seller inventory shows demo product images', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Jamal Store/)
    await expect(page).toHaveURL(/\/seller/)
    await page.getByRole('tab', { name: /Inventory|ইনভেন্টরি/i }).click()
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Inventory and sales|ইনভেন্টরি ও বিক্রয়/i,
    )

    const demoProductImg = page.locator('main img[src*="/demo-products/"]').first()
    await expect(demoProductImg).toBeVisible({ timeout: 30_000 })
    await expect(demoProductImg).toHaveAttribute('src', /\/demo-products\/.+\.(png|svg)/)
  })

  test('field officer verification queue shows product cards', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Sadia Rahman/)
    await expect(page).toHaveURL(/\/field-officer/)
    await page.getByRole('tab', { name: /Verification|যাচাই/i }).click()

    const queueImg = page.locator('main img[src*="/demo-products/"]').first()
    const emptyCopy = page.getByText(/Insufficient data|অপর্যাপ্ত/i)
    await expect(queueImg.or(emptyCopy)).toBeVisible({ timeout: 30_000 })
    if (await queueImg.isVisible()) {
      await expect(queueImg).toHaveAttribute('src', /\/demo-products\/.+\.(png|svg)/)
    }
  })
})
