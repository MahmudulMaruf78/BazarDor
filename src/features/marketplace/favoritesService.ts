import { dataLayer } from '@/data'
import type { RepositoryResult } from '@/types/result'
import { ok } from '@/types/result'

export async function toggleFavoriteListing(listingId: string): Promise<RepositoryResult<string[]>> {
  const current = dataLayer.preferences.get()
  if (!current.ok) return current
  const favorites = new Set(current.data.favoriteListingIds)
  if (favorites.has(listingId)) favorites.delete(listingId)
  else favorites.add(listingId)
  const next = [...favorites]
  const saved = dataLayer.preferences.set({ ...current.data, favoriteListingIds: next })
  if (!saved.ok) return saved
  return ok(next)
}

export async function listFavoriteListingIds(): Promise<RepositoryResult<string[]>> {
  const current = dataLayer.preferences.get()
  if (!current.ok) return current
  return ok(current.data.favoriteListingIds)
}
