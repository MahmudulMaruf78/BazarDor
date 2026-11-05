import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it, beforeEach } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'
import { appRoutes } from '@/app/router'
import { translate } from '@/lib/i18n/messages'

import { LOCAL_STORAGE_KEYS } from '@/constants/storage'

const PREFS_KEY = LOCAL_STORAGE_KEYS.preferences

function renderHome() {
  const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] })
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('locale persistence', () => {
  beforeEach(() => {
    localStorage.removeItem(PREFS_KEY)
  })

  it('persists bn choice in localStorage after toggle', async () => {
    renderHome()
    await screen.findAllByRole('link', { name: /Sign in|সাইন ইন/i })
    await userEvent.click(screen.getAllByRole('button', { name: 'BN' })[0]!)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(translate('bn', 'homeTitle'))
    const raw = localStorage.getItem(PREFS_KEY)
    expect(raw).toBeTruthy()
    expect(raw).toMatch(/"locale":"bn"/)
  })
})
