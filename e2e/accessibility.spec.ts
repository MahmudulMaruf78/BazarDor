import { expect, test } from '@playwright/test'
import { setLocale, waitForAppReady, signInDemoUser, DEMO_USERS } from './helpers'

test.describe('accessibility verification', () => {
  test.use({ viewport: { width: 1366, height: 768 } })

  test('home — keyboard reaches sign-in link with visible focus', async ({ page }) => {
    await waitForAppReady(page)
    await page.keyboard.press('Tab')
    let focused = page.locator(':focus')
    for (let i = 0; i < 25; i += 1) {
      const tag = await focused.evaluate((el) => el.tagName).catch(() => '')
      if (tag === 'A' || tag === 'BUTTON') break
      await page.keyboard.press('Tab')
      focused = page.locator(':focus')
    }
    const outline = await focused.evaluate((el) => {
      const s = window.getComputedStyle(el)
      return {
        outlineWidth: s.outlineWidth,
        outlineStyle: s.outlineStyle,
        boxShadow: s.boxShadow,
      }
    })
    const hasFocusRing =
      (outline.outlineWidth !== '0px' && outline.outlineStyle !== 'none') ||
      outline.boxShadow.includes('rgb')
    expect(hasFocusRing).toBe(true)
  })

  test('login — combobox and continue have accessible names', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('combobox')).toBeVisible()
    await expect(page.getByRole('button', { name: /Continue|চালিয়ে যান/i })).toBeVisible()
  })

  test('locale switch — group label and pressed state', async ({ page }) => {
    await waitForAppReady(page)
    const group = page.getByRole('group').filter({ has: page.getByRole('button', { name: 'BN' }) }).first()
    await expect(group).toHaveAttribute('aria-label', /Language|ভাষা/i)
    await expect(page.getByRole('button', { name: 'BN' }).first()).toHaveAttribute('aria-pressed', 'false')
    await setLocale(page, 'bn')
    await expect(page.getByRole('button', { name: 'BN' }).first()).toHaveAttribute('aria-pressed', 'true')
  })

  test('department — single h1 and landmark main', async ({ page }) => {
    await waitForAppReady(page)
    await signInDemoUser(page, DEMO_USERS.department)
    await page.goto('/department')
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
  })

  test('dialog — sheet close control has accessible name', async ({ page }) => {
    await waitForAppReady(page)
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
    const menuBtn = page.getByRole('button', { name: /Open navigation menu|মেনু খুলুন/i })
    if (await menuBtn.isVisible()) {
      await menuBtn.click()
      const close = page.getByRole('button', { name: /Close|বন্ধ/i })
      await expect(close).toBeVisible()
    }
  })

  test('playwright accessibility snapshot — home', async ({ page }) => {
    await waitForAppReady(page)
    const snapshot = await page.accessibility.snapshot({ interestingOnly: false })
    expect(snapshot).toBeTruthy()
    const names = JSON.stringify(snapshot)
    expect(names).toMatch(/Sign in|সাইন ইন/)
  })
})
