import { expect, type Page } from "@playwright/test";

export async function waitForAppReady(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("main").getByRole("link", { name: /Sign in|সাইন ইন/i }).first(),
  ).toBeVisible({
    timeout: 60_000,
  });
}

export async function signInDemoUser(page: Page, userName: RegExp) {
  await page.goto("/login");
  await expect(page.getByRole("combobox")).toBeVisible({ timeout: 60_000 });
  await page.getByRole("combobox").click();
  await page.getByRole("option", { name: userName }).click();
  await page.getByRole("button", { name: /Continue|চালিয়ে যান/i }).click();
  await expect(page).not.toHaveURL(/\/login\/?$/, { timeout: 30_000 });
}

export async function setLocale(page: Page, locale: "bn" | "en") {
  const targetBtn = page
    .getByRole("button", { name: locale === "bn" ? "BN" : "EN" })
    .first();
  if ((await targetBtn.getAttribute("aria-pressed")) !== "true") {
    await targetBtn.click();
  }
  await expect(targetBtn).toHaveAttribute("aria-pressed", "true");
}

/** ponytail: 2px slack for subpixel rounding */
export async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    const slack = 2;
    if (doc.scrollWidth > doc.clientWidth + slack)
      return doc.scrollWidth - doc.clientWidth;
    const main = document.querySelector("main");
    if (main && main.scrollWidth > main.clientWidth + slack)
      return main.scrollWidth - main.clientWidth;
    return 0;
  });
  expect(overflow, `horizontal overflow ${overflow}px`).toBe(0);
}

export async function waitForMainHeading(page: Page) {
  await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible({
    timeout: 30_000,
  });
}

export const DEMO_USERS = {
  farmer: /Rahim Mia/i,
  buyer: /Karim Traders/i,
  seller: /Jamal Store/i,
  fieldOfficer: /Sadia Rahman/i,
  department: /Agri Analytics/i,
  admin: /System Admin/i,
} as const;

export const PUBLIC_PATHS = ["/", "/explore", "/product/prod-potato"] as const;

export const ROLE_PATHS = {
  farmer: "/farmer",
  buyer: "/buyer",
  seller: "/seller",
  fieldOfficer: "/field-officer",
  department: "/department",
  admin: "/admin",
} as const;

/** English chrome that must not appear in BN mode (user-facing). */
export const BN_DENY_ENGLISH =
  /\b(Dashboard|Submit|Available|Pending|Walkthrough|No match|Sign in|Explore markets|Search|Browse|Continue|Overview|Inventory|Verification|Accept|Reject|Loading\.\.\.|Coming Soon|Official average market price)\b/;

export async function signOutDemo(page: Page) {
  const menuBtn = page.getByRole('button', { name: /Open navigation menu|মেনু খুলুন/i })
  if (await menuBtn.isVisible()) {
    await menuBtn.click()
  }
  await page.getByRole('button', { name: /Sign out|সাইন আউট/i }).click()
  await expect(page).toHaveURL(/\/login/, { timeout: 15_000 })
}

export async function assertBnChrome(page: Page, context: string) {
  const text = await page.locator("body").innerText();
  const hit = text.match(BN_DENY_ENGLISH);
  expect(
    hit,
    `${context}: unexpected English UI: ${hit?.[0] ?? ""}`,
  ).toBeNull();
}
