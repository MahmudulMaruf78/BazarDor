import { expect, test } from '@playwright/test'
import { signInDemoUser, signOutDemo, waitForAppReady } from './helpers'

test.describe('demo marketplace walkthrough', () => {
  test('buyer bid → seller accept → both confirm (demo transaction)', async ({ page }) => {
    await waitForAppReady(page)

    await signInDemoUser(page, /Karim Traders/)
    await expect(page).toHaveURL(/\/buyer/)

    await page.getByRole('tab', { name: /Browse|ব্রাউজ/i }).click()
    await page.getByLabel(/^Search$|অনুসন্ধান/i).fill('Potato')
    await page.goto('/product/prod-potato')
    await expect(page.getByText(/Jamal Store|জামাল/i)).toBeVisible({ timeout: 15_000 })
    await page
      .getByRole('button', { name: /Select this offer|এই অফারটি বেছে নিন/i })
      .first()
      .click()
    await page
      .getByRole('button', { name: /Submit offer on selected listing|নির্বাচিত তালিকায় অফার জমা দিন/i })
      .click()
    await page.getByRole('button', { name: /Send offer|অফার পাঠান/i }).click()
    await expect(page.getByText(/Offer submitted|অফার জমা/i)).toBeVisible({ timeout: 15_000 })

    await page.goto('/buyer')
    await signOutDemo(page)

    await signInDemoUser(page, /Jamal Store/)
    await expect(page).toHaveURL(/\/seller/)
    await page.getByRole('tab', { name: /Offers|অফার/i }).click()
    await page.getByRole('button', { name: /^Accept$|^গ্রহণ$/i }).first().click()
    await expect(page.getByText(/Offer accepted|অফার গৃহীত/i)).toBeVisible({ timeout: 15_000 })

    await signOutDemo(page)

    await signInDemoUser(page, /Karim Traders/)
    await page.getByRole('tab', { name: /My bids|আমার প্রস্তাব/i }).click()
    await page.getByRole('button', { name: /^Confirm$|^নিশ্চিত$/i }).first().click()
    await expect(page.getByText(/Buyer confirmed|ক্রেতা নিশ্চিত/i)).toBeVisible({ timeout: 15_000 })

    await signOutDemo(page)

    await signInDemoUser(page, /Jamal Store/)
    await page.getByRole('tab', { name: /Inventory|ইনভেন্টরি/i }).click()
    await page.getByRole('button', { name: /Confirm open transaction|খোলা লেনদেন/i }).click()
    await expect(page.getByText(/Seller confirmed|বিক্রেতা নিশ্চিত/i)).toBeVisible({ timeout: 15_000 })
  })

  test('listing detail route shows demo listing', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Karim Traders/)
    await page.getByRole('tab', { name: /Browse|ব্রাউজ/i }).click()
    await page.getByRole('link', { name: /View details|বিস্তারিত/i }).first().click()
    await expect(page).toHaveURL(/\/listing\//)
    await expect(page.getByText(/Official average market price|সরকারi গড় বাজারদর/i)).toBeVisible()
  })
})
