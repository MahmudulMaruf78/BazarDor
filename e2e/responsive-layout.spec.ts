import { test } from '@playwright/test'
import {
  DEMO_USERS,
  PUBLIC_PATHS,
  ROLE_PATHS,
  expectNoHorizontalOverflow,
  setLocale,
  signInDemoUser,
  signOutDemo,
  waitForAppReady,
  waitForMainHeading,
} from './helpers'

const VIEWPORTS = [
  { label: '375px mobile', width: 375, height: 812 },
  { label: '390px mobile', width: 390, height: 844 },
  { label: '768px tablet', width: 768, height: 1024 },
  { label: '1366px desktop', width: 1366, height: 768 },
  { label: '1440px desktop', width: 1440, height: 900 },
] as const

for (const vp of VIEWPORTS) {
  test.describe(`responsive layout — ${vp.label}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('public routes — no horizontal overflow', async ({ page }) => {
      await waitForAppReady(page)
      for (const path of PUBLIC_PATHS) {
        await page.goto(path)
        await waitForMainHeading(page)
        await expectNoHorizontalOverflow(page)
      }
    })

    test('role dashboards — no horizontal overflow', async ({ page }) => {
      await waitForAppReady(page)
      const roles = Object.entries(DEMO_USERS) as [keyof typeof DEMO_USERS, RegExp][]
      for (const [key, userPattern] of roles) {
        await signInDemoUser(page, userPattern)
        await page.goto(ROLE_PATHS[key])
        await waitForMainHeading(page)
        await expectNoHorizontalOverflow(page)
        await signOutDemo(page)
      }
    })

    test('field officer — all tabs', async ({ page }) => {
      await waitForAppReady(page)
      await signInDemoUser(page, DEMO_USERS.fieldOfficer)
      await page.goto(ROLE_PATHS.fieldOfficer)
      const tabs = page.getByRole('tab')
      const count = await tabs.count()
      for (let i = 0; i < count; i += 1) {
        await tabs.nth(i).click()
        await expectNoHorizontalOverflow(page)
      }
    })

    test('buyer BN — wrapping smoke', async ({ page }) => {
      await waitForAppReady(page)
      await setLocale(page, 'bn')
      await signInDemoUser(page, DEMO_USERS.buyer)
      await page.goto(ROLE_PATHS.buyer)
      await page.getByRole('tab', { name: /ব্রাউজ|Browse/i }).click()
      await expectNoHorizontalOverflow(page)
    })
  })
}
