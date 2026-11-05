import { expect, type Page } from '@playwright/test'

export async function waitForAppReady(page: Page) {
  await page.goto('/')
  await expect(page.getByRole('main').getByRole('link', { name: /Sign in|সাইন ইন/i })).toBeVisible({
    timeout: 60_000,
  })
}

export async function signInDemoUser(page: Page, userName: RegExp) {
  await page.goto('/login')
  await expect(page.getByText(/Choose an account|অ্যাকাউন্ট বেছে নিন/i)).toBeVisible()
  await page.getByRole('combobox').click()
  await page.getByRole('option', { name: userName }).click()
  await page.getByRole('button', { name: /Continue|চালিয়ে যান/i }).click()
  await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 })
}
