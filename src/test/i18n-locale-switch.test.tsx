import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'
import { appRoutes } from '@/app/router'
import { MESSAGES, translate } from '@/lib/i18n/messages'

function renderHome() {
  const router = createMemoryRouter(appRoutes, { initialEntries: ['/'] })
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('locale switch', () => {
  it('updates home heading without navigation when toggling bn/en', async () => {
    renderHome()
    await screen.findAllByRole('link', { name: /Sign in|সাইন ইন/i })

    await userEvent.click(screen.getByRole('button', { name: 'BN' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(translate('bn', 'homeTitle'))

    await userEvent.click(screen.getByRole('button', { name: 'EN' }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(MESSAGES.en.homeTitle)
  })
})
