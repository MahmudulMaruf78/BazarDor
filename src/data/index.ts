import { domainRepositories } from '@/data/adapters/mock/indexedDbRepositories'
import { initializeDemoData, resetDemoData } from '@/data/bootstrap/demoDataLifecycle'
import { demoSessionStore, preferencesStore } from '@/data/adapters/localStorage/sessionStore'
import { buildHomeProductSnapshots } from '@/services/productCardMarketSnapshot'
import type { OfficialAverageResult } from '@/services/types'
import type { RepositoryResult } from '@/types/result'

export type HomeOverviewProduct = {
  id: string
  nameEn: string
  nameBn: string
  imageUrl: string
  locationChainEn: string
  locationChainBn: string
  askingPricePerUnit: number
  unitCode: string
  officialAverage: OfficialAverageResult
}

export type HomeOverview = {
  products: HomeOverviewProduct[]
  locations: { id: string; nameEn: string; nameBn: string }[]
}

export const dataLayer = {
  initialize: initializeDemoData,
  reset: resetDemoData,
  repos: domainRepositories,
  session: demoSessionStore,
  preferences: preferencesStore,
}

export async function getHomeOverview(): Promise<RepositoryResult<HomeOverview>> {
  const [products, locations, listings, entries, units] = await Promise.all([
    domainRepositories.catalog.listProducts(),
    domainRepositories.catalog.listLocations(),
    domainRepositories.marketplace.listListings(),
    domainRepositories.prices.listPriceEntries(),
    domainRepositories.catalog.listUnits(),
  ])
  if (!products.ok) return products
  if (!locations.ok) return locations
  if (!listings.ok) return listings
  if (!entries.ok) return entries
  if (!units.ok) return units

  const snapshots = buildHomeProductSnapshots(
    products.data,
    listings.data,
    entries.data,
    locations.data,
    units.data,
  )

  return {
    ok: true,
    data: {
      products: products.data
        .map((product) => {
          const snap = snapshots.get(product.id)
          if (!snap) return null
          return {
            id: product.id,
            nameEn: product.nameEn,
            nameBn: product.nameBn,
            imageUrl: product.imageUrl,
            locationChainEn: snap.locationChainEn,
            locationChainBn: snap.locationChainBn,
            askingPricePerUnit: snap.askingPricePerUnit,
            unitCode: snap.unitCode,
            officialAverage: snap.officialAverage,
          }
        })
        .filter((row): row is HomeOverviewProduct => row != null),
      locations: locations.data.map((location) => ({
        id: location.id,
        nameEn: location.nameEn,
        nameBn: location.nameBn,
      })),
    },
  }
}

export type { RepositoryResult }
