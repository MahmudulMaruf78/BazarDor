import { expect, test } from '@playwright/test'
import { signInDemoUser, waitForAppReady } from './helpers'

test.describe('demo walkthrough smoke', () => {
  test('home shows sign in', async ({ page }) => {
    await waitForAppReady(page)
    await expect(page.getByRole('main').getByRole('link', { name: /Sign in|সাইন ইন/i }).first()).toBeVisible()
  })

  test('explore drill-down reaches product cards', async ({ page }) => {
    await waitForAppReady(page)
    await page.getByRole('navigation').getByRole('link', { name: /Explore markets|বাজার অনুসন্ধান/i }).click()
    await expect(page).toHaveURL(/\/explore/)
    await page.getByRole('button', { name: /Khulna Division|খুলনা বিভাগ/i }).click()
    await page.getByRole('button', { name: /Jashore District|যশোর জেলা/i }).click()
    await page.getByRole('button', { name: /Monirampur Upazila|মণিরামপুর উপজেলা/i }).click()
    await page.getByRole('button', { name: /Durgapur Union|দুর্গাপুর ইউনিয়ন/i }).click()
    await expect(page.getByText(/Official average market price|Official market average|সরকারi গড় বাজারদর/i).first()).toBeVisible({
      timeout: 30_000,
    })
  })

  test('unauthenticated farmer route prompts login', async ({ page }) => {
    await waitForAppReady(page)
    await page.goto('/farmer')
    await expect(page.getByRole('combobox')).toBeVisible()
  })

  test('farmer session reaches marketplace', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Rahim Mia/)
    await expect(page).toHaveURL(/\/farmer/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Listings and price entries|তালিকা ও মূল্য এন্ট্রি/i,
    )
  })

  test('department session loads analytics shell', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Agri Analytics/)
    await expect(page).toHaveURL(/\/department/)
    await expect(page.getByRole('button', { name: /Apply filters|ফিল্টার প্রয়োগ/i })).toBeVisible()
  })
})
