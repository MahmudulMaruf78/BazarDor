import { expect, test } from '@playwright/test'
import { signInDemoUser, waitForAppReady } from './helpers'

test.describe('demo marketplace walkthrough', () => {
  test('buyer bid → seller accept → both confirm (demo transaction)', async ({ page }) => {
    await waitForAppReady(page)

    await signInDemoUser(page, /Karim Traders/)
    await expect(page).toHaveURL(/\/buyer/)

    await page.getByLabel(/^Search$|অনুসন্ধান/i).fill('Potato')
    await page.getByRole('button', { name: /^Offer$|^অফার$/i }).first().click()
    await page.getByRole('button', { name: /Send offer|অফার পাঠান/i }).click()
    await expect(page.getByText(/Offer submitted|অফার জমা/i)).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /Sign out|সাইন আউট/i }).click()

    await signInDemoUser(page, /Jamal Store/)
    await expect(page).toHaveURL(/\/seller/)
    await page.getByRole('button', { name: /^Accept$|^গ্রহণ$/i }).first().click()
    await expect(page.getByText(/Offer accepted|অফার গৃহীত/i)).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /Sign out|সাইন আউট/i }).click()

    await signInDemoUser(page, /Karim Traders/)
    await page.getByRole('tab', { name: /My bids|আমার bid/i }).click()
    await page.getByRole('button', { name: /^Confirm$|^নিশ্চিত$/i }).first().click()
    await expect(page.getByText(/Buyer confirmed|ক্রেতা নিশ্চিত/i)).toBeVisible({ timeout: 15_000 })

    await page.getByRole('button', { name: /Sign out|সাইন আউট/i }).click()

    await signInDemoUser(page, /Jamal Store/)
    await page.getByRole('button', { name: /Confirm open transaction|খোলা লেনদেন/i }).click()
    await expect(page.getByText(/Seller confirmed|বিক্রেতা নিশ্চিত/i)).toBeVisible({ timeout: 15_000 })
  })

  test('listing detail route shows demo listing', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Karim Traders/)
    await page.getByRole('link', { name: /View details|বিস্তারিত/i }).first().click()
    await expect(page).toHaveURL(/\/listing\//)
    await expect(page.getByText(/Official market average|সরকারি বাজার গড়/i)).toBeVisible()
  })
})
