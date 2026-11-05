import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'
import { appRoutes } from '@/app/router'

const DENY_LATIN = /\b(Dashboard|Submit|Available|Pending|Walkthrough|No match)\b/

async function renderBn(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
  await screen.findAllByRole('link', { name: /Sign in|সাইন ইন/i })
  const bnButtons = screen.getAllByRole('button', { name: 'BN' })
  const target = bnButtons.find((b) => b.getAttribute('aria-pressed') !== 'true') ?? bnButtons[0]
  if (target.getAttribute('aria-pressed') !== 'true') {
    await userEvent.click(target)
  }
}

describe('bn role page smoke', () => {
  it.each(['/', '/explore', '/login', '/farmer', '/department', '/field-officer'])(
    '%s has no denylisted Latin chrome after BN toggle',
    async (path) => {
      await renderBn(path)
      expect(document.body.textContent ?? '').not.toMatch(DENY_LATIN)
    },
  )
})
