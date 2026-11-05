import { expect, test } from '@playwright/test'
import { signInDemoUser, waitForAppReady } from './helpers'

test.describe('demo walkthrough smoke', () => {
  test('home shows sign in', async ({ page }) => {
    await waitForAppReady(page)
    await expect(page.getByRole('main').getByRole('link', { name: /Sign in|সাইন ইন/i })).toBeVisible()
  })

  test('explore drill-down reaches product cards', async ({ page }) => {
    await waitForAppReady(page)
    await page.getByRole('link', { name: /Explore markets|বাজার অনুসন্ধান/i }).click()
    await expect(page).toHaveURL(/\/explore/)
    await page.getByRole('button', { name: /Khulna Division|খুলনা বিভাগ/i }).click()
    await page.getByRole('button', { name: /Jashore District|যশোর জেলা/i }).click()
    await page.getByRole('button', { name: /Monirampur Upazila|মণিরামপুর উপজেলা/i }).click()
    await page.getByRole('button', { name: /Durgapur Union|দুর্গাপুর ইউনিয়ন/i }).click()
    await expect(page.getByText(/Official market average|সরকারি বাজার গড়/i).first()).toBeVisible({
      timeout: 30_000,
    })
  })

  test('unauthenticated farmer route prompts login', async ({ page }) => {
    await waitForAppReady(page)
    await page.goto('/farmer')
    await expect(page.getByText(/Choose an account|অ্যাকাউন্ট বেছে নিন/i)).toBeVisible()
  })

  test('farmer session reaches marketplace', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Rahim Mia/)
    await expect(page).toHaveURL(/\/farmer/)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      /Farmer marketplace|কৃষক মার্কেটপ্লেস/i,
    )
  })

  test('department session loads analytics shell', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, /Agri Analytics/)
    await expect(page).toHaveURL(/\/department/)
    await expect(page.getByRole('button', { name: /Apply filters|ফিল্টার প্রয়োগ/i })).toBeVisible()
  })
})
