import { createBrowserRouter } from 'react-router-dom'
import { RequireAuth, RedirectIfAuthenticated } from '@/app/router/guards'
import { RequireRouteRole } from '@/app/router/RequireRouteRole'
import { DemoLoginPage } from '@/features/auth/DemoLoginPage'
import { AccessDeniedPage, NotFoundPage } from '@/features/errors/AppStatusPages'
import { HomePage } from '@/features/home/HomePage'
import { ExploreMarketPage } from '@/features/home/ExploreMarketPage'
import { FarmerMarketplacePage } from '@/features/marketplace/FarmerMarketplacePage'
import { BuyerMarketplacePage } from '@/features/marketplace/BuyerMarketplacePage'
import { SellerMarketplacePage } from '@/features/marketplace/SellerMarketplacePage'
import { FieldOfficerPage } from '@/features/field-officer/FieldOfficerPage'
import { DepartmentAnalyticsPage } from '@/features/department/DepartmentAnalyticsPage'
import { AdminDemoPage } from '@/features/admin/AdminDemoPage'
import { ListingDetailPage } from '@/features/marketplace/ListingDetailPage'
import { AuthLayout } from '@/layouts/auth-layout/AuthLayout'
import { DashboardLayout } from '@/layouts/dashboard-layout/DashboardLayout'
import { PublicLayout } from '@/layouts/public-layout/PublicLayout'

export const appRoutes = [
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'explore', element: <ExploreMarketPage /> },
    ],
  },
  {
    path: '/login',
    element: <RedirectIfAuthenticated />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ index: true, element: <DemoLoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/access-denied', element: <AccessDeniedPage /> },
          { path: '/listing/:listingId', element: <ListingDetailPage /> },
          {
            path: '/farmer',
            element: (
              <RequireRouteRole>
                <FarmerMarketplacePage />
              </RequireRouteRole>
            ),
          },
          {
            path: '/buyer',
            element: (
              <RequireRouteRole>
                <BuyerMarketplacePage />
              </RequireRouteRole>
            ),
          },
          {
            path: '/seller',
            element: (
              <RequireRouteRole>
                <SellerMarketplacePage />
              </RequireRouteRole>
            ),
          },
          {
            path: '/field-officer',
            element: (
              <RequireRouteRole>
                <FieldOfficerPage />
              </RequireRouteRole>
            ),
          },
          {
            path: '/department',
            element: (
              <RequireRouteRole>
                <DepartmentAnalyticsPage />
              </RequireRouteRole>
            ),
          },
          {
            path: '/admin',
            element: (
              <RequireRouteRole>
                <AdminDemoPage />
              </RequireRouteRole>
            ),
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]

export const appRouter = createBrowserRouter(appRoutes)
