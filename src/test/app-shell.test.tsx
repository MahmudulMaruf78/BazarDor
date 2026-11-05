import { render, screen, waitFor } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'
import { appRoutes } from '@/app/router'

function renderAt(path: string) {
  const router = createMemoryRouter(appRoutes, { initialEntries: [path] })
  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('Phase 1 app shell', () => {
  it('shows market products on the home page', async () => {
    renderAt('/')
    expect((await screen.findAllByRole('link', { name: /Sign in|সাইন ইন/i })).length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      /Market prices|crop listings|বাজার মূল্য|ফসলের তালিকা/i,
    )
    const productImages = await screen.findAllByRole('img', { name: /Paddy|Potato|Onion|ধান|আলু|পেঁয়াজ/i })
    expect(productImages.length).toBeGreaterThanOrEqual(1)
    expect((await screen.findAllByText(/Official average market price|Official market average|সরকারi গড় বাজারদর|সরকারি বাজার/i)).length).toBeGreaterThanOrEqual(1)
  })
})

describe('Phase 4 protected routes', () => {
  it('redirects unauthenticated users from dashboard to login', async () => {
    renderAt('/farmer')
    await waitFor(() => {
      expect(screen.getByLabelText(/Account|অ্যাকাউন্ট/i)).toBeInTheDocument()
    })
  })
})
