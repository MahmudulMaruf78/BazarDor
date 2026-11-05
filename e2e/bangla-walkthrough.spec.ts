import { expect, test } from '@playwright/test'
import {
  DEMO_USERS,
  PUBLIC_PATHS,
  ROLE_PATHS,
  assertBnChrome,
  setLocale,
  signInDemoUser,
  signOutDemo,
  waitForAppReady,
  waitForMainHeading,
} from './helpers'

test.describe('Bangla browser walkthrough', () => {
  test('public pages in BN', async ({ page }) => {
    await waitForAppReady(page)
    await setLocale(page, 'bn')
    for (const path of PUBLIC_PATHS) {
      await page.goto(path)
      await waitForMainHeading(page)
      await assertBnChrome(page, path)
    }
  })

  test('role workspaces in BN', async ({ page }) => {
    await waitForAppReady(page)
    await setLocale(page, 'bn')
    const roles = Object.entries(DEMO_USERS) as [keyof typeof DEMO_USERS, RegExp][]
    for (const [key, userPattern] of roles) {
      await signInDemoUser(page, userPattern)
      await page.goto(ROLE_PATHS[key])
      await waitForMainHeading(page)
      await assertBnChrome(page, ROLE_PATHS[key])

      const tabs = page.getByRole('tab')
      const tabCount = await tabs.count()
      for (let i = 0; i < tabCount; i += 1) {
        await tabs.nth(i).click()
        await assertBnChrome(page, `${ROLE_PATHS[key]} tab ${i}`)
      }

      await signOutDemo(page)
    }
  })

  test('buyer listing detail in BN', async ({ page }) => {
    await waitForAppReady(page)
    await setLocale(page, 'bn')
    await signInDemoUser(page, DEMO_USERS.buyer)
    await page.goto(ROLE_PATHS.buyer)
    await page.getByRole('tab', { name: /ব্রাউজ|Browse/i }).click()
    await page.getByRole('link', { name: /বিস্তারিত|View details/i }).first().click()
    await expect(page).toHaveURL(/\/listing\//)
    await assertBnChrome(page, 'listing detail')
  })

  test('English restored after EN toggle', async ({ page }) => {
    await waitForAppReady(page)
    await setLocale(page, 'bn')
    await expect(page.getByRole('main').getByRole('link', { name: /সাইন ইন/i }).first()).toBeVisible()
    await setLocale(page, 'en')
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Market prices|crop listings/i)
  })
})
