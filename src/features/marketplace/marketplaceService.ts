import { dataLayer } from '@/data'
import {
  buildProductBrowseCards,
  filterListingsForBrowse,
  paginateProductBrowseCards,
  type ProductBrowsePage,
} from '@/services/productCatalogBrowse'
import { normalizeMarketPrice } from '@/services/priceNormalization'
import { validateListingEligibleForBid } from '@/services/listingOfferEligibility'
import {
  completeListingSale,
  releaseListingReservation,
  reserveListingStock,
  validateAvailableStock,
} from '@/services/stockService'
import type { Bid, Listing, Notification, PriceEntry, Transaction } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

async function pushNotification(input: Omit<Notification, 'id' | 'createdAt' | 'read'>) {
  const notification: Notification = {
    id: newId('notif'),
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  }
  await dataLayer.repos.notifications.saveNotification(notification)
}

export type ListingFilters = {
  search?: string
  categoryId?: string
  /** Exact listing leaf location (legacy). */
  locationId?: string
  /** Expand listings under this scope id (division → descendants). */
  locationScopeId?: string
  /** Effective product variant id from catalog. */
  variantId?: string
  sort?: 'newest' | 'price-asc' | 'price-desc'
  page?: number
  pageSize?: number
}

export type ListingPage = {
  items: Listing[]
  total: number
  page: number
  pageSize: number
}

export type { ProductBrowsePage } from '@/services/productCatalogBrowse'

export async function browseListings(filters: ListingFilters = {}): Promise<RepositoryResult<ListingPage>> {
  const [listings, products, locations, variants] = await Promise.all([
    dataLayer.repos.marketplace.listListings(),
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listLocations(),
    dataLayer.repos.catalog.listProductVariants(),
  ])
  if (!listings.ok) return listings
  if (!products.ok) return products
  if (!locations.ok) return locations
  if (!variants.ok) return variants

  const items = filterListingsForBrowse(
    listings.data,
    filters,
    products.data,
    locations.data,
    variants.data,
  )

  const pageSize = filters.pageSize ?? 6
  const page = Math.max(1, filters.page ?? 1)
  const start = (page - 1) * pageSize

  return ok({
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
  })
}

export async function browseProductCatalog(
  filters: ListingFilters = {},
): Promise<RepositoryResult<ProductBrowsePage>> {
  const [listings, products, locations, units, priceEntries, variants] = await Promise.all([
    dataLayer.repos.marketplace.listListings(),
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listLocations(),
    dataLayer.repos.catalog.listUnits(),
    dataLayer.repos.prices.listPriceEntries(),
    dataLayer.repos.catalog.listProductVariants(),
  ])
  if (!listings.ok) return listings
  if (!products.ok) return products
  if (!locations.ok) return locations
  if (!units.ok) return units
  if (!priceEntries.ok) return priceEntries
  if (!variants.ok) return variants

  const filtered = filterListingsForBrowse(
    listings.data,
    filters,
    products.data,
    locations.data,
    variants.data,
  )
  const cards = buildProductBrowseCards(
    filtered,
    products.data,
    variants.data,
    priceEntries.data,
    locations.data,
    units.data,
    filters.locationScopeId,
  )
  return ok(paginateProductBrowseCards(cards, filters))
}

export async function restockListing(input: {
  sellerUserId: string
  listingId: string
  additionalQuantity: number
}): Promise<RepositoryResult<Listing>> {
  if (input.additionalQuantity <= 0) {
    return err({ code: 'VALIDATION', message: 'Additional quantity must be positive.' })
  }
  const listingResult = await dataLayer.repos.marketplace.getListingById(input.listingId)
  if (!listingResult.ok) return listingResult
  if (listingResult.data.sellerUserId !== input.sellerUserId) {
    return err({ code: 'FORBIDDEN', message: 'Only the listing owner can restock.' })
  }

  const listing = listingResult.data
  const updated: Listing = {
    ...listing,
    quantity: listing.quantity + input.additionalQuantity,
    availableQuantity: listing.availableQuantity + input.additionalQuantity,
    status: 'active',
  }
  return dataLayer.repos.marketplace.saveListing(updated)
}

export async function listSellerTransactions(
  sellerUserId: string,
): Promise<RepositoryResult<Transaction[]>> {
  const txns = await dataLayer.repos.marketplace.listTransactions()
  if (!txns.ok) return txns
  return ok(
    txns.data
      .filter((row) => row.sellerUserId === sellerUserId)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)),
  )
}

export async function createListing(input: {
  sellerUserId: string
  productId: string
  locationId: string
  quantity: number
  unitId: string
  askingPricePerUnit: number
}): Promise<RepositoryResult<Listing>> {
  if (input.quantity <= 0 || input.askingPricePerUnit <= 0) {
    return err({ code: 'VALIDATION', message: 'Quantity and asking price must be positive.' })
  }

  const listing: Listing = {
    id: newId('list'),
    sellerUserId: input.sellerUserId,
    productId: input.productId,
    locationId: input.locationId,
    quantity: input.quantity,
    unitId: input.unitId,
    availableQuantity: input.quantity,
    reservedQuantity: 0,
    completedQuantity: 0,
    askingPricePerUnit: input.askingPricePerUnit,
    status: 'active',
    createdAt: new Date().toISOString(),
  }

  const saved = await dataLayer.repos.marketplace.saveListing(listing)
  if (saved.ok) {
    await pushNotification({
      userId: input.sellerUserId,
      title: 'Listing created',
      body: 'Your listing is visible in the marketplace catalog.',
    })
  }
  return saved
}

export async function submitBid(input: {
  buyerUserId: string
  listingId: string
  quantity: number
  offeredPricePerUnit: number
}): Promise<RepositoryResult<Bid>> {
  const listingResult = await dataLayer.repos.marketplace.getListingById(input.listingId)
  if (!listingResult.ok) return listingResult

  const eligible = validateListingEligibleForBid(listingResult.data)
  if (!eligible.ok) {
    return err({ code: 'VALIDATION', message: eligible.error.message, details: eligible.error.details })
  }

  const stockCheck = validateAvailableStock(listingResult.data, input.quantity)
  if (!stockCheck.ok) {
    return err({ code: 'VALIDATION', message: stockCheck.error.message, details: stockCheck.error.details })
  }

  const bid: Bid = {
    id: newId('bid'),
    listingId: input.listingId,
    buyerUserId: input.buyerUserId,
    quantity: input.quantity,
    unitId: listingResult.data.unitId,
    offeredPricePerUnit: input.offeredPricePerUnit,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  const saved = await dataLayer.repos.marketplace.saveBid(bid)
  if (saved.ok) {
    await pushNotification({
      userId: listingResult.data.sellerUserId,
      title: 'Offer received',
      body: 'A buyer submitted an offer on your listing.',
    })
  }
  return saved
}

export async function decideBid(input: {
  sellerUserId: string
  bidId: string
  decision: 'accepted' | 'rejected'
}): Promise<RepositoryResult<{ bid: Bid; listing?: Listing; transaction?: Transaction }>> {
  const bids = await dataLayer.repos.marketplace.listBids()
  if (!bids.ok) return bids
  const bid = bids.data.find((row) => row.id === input.bidId)
  if (!bid) return err({ code: 'NOT_FOUND', message: 'Bid not found.' })
  if (bid.status !== 'pending') return err({ code: 'VALIDATION', message: 'Bid is already decided.' })

  const listingResult = await dataLayer.repos.marketplace.getListingById(bid.listingId)
  if (!listingResult.ok) return listingResult
  if (listingResult.data.sellerUserId !== input.sellerUserId) {
    return err({ code: 'FORBIDDEN', message: 'Only the listing seller can decide offers.' })
  }

  if (input.decision === 'rejected') {
    const rejected: Bid = { ...bid, status: 'rejected' }
    const saved = await dataLayer.repos.marketplace.saveBid(rejected)
    if (!saved.ok) return saved
    await pushNotification({
      userId: bid.buyerUserId,
      title: 'Offer rejected',
      body: 'Your offer was rejected. Stock was not reserved.',
    })
    return ok({ bid: saved.data })
  }

  const reserved = reserveListingStock(listingResult.data, bid.quantity)
  if (!reserved.ok) {
    return err({ code: 'VALIDATION', message: reserved.error.message, details: reserved.error.details })
  }

  const accepted: Bid = { ...bid, status: 'accepted' }
  const savedBid = await dataLayer.repos.marketplace.saveBid(accepted)
  if (!savedBid.ok) return savedBid

  const savedListing = await dataLayer.repos.marketplace.saveListing(reserved.data)
  if (!savedListing.ok) return savedListing

  const transaction: Transaction = {
    id: newId('txn'),
    bidId: bid.id,
    listingId: bid.listingId,
    buyerUserId: bid.buyerUserId,
    sellerUserId: listingResult.data.sellerUserId,
    quantity: bid.quantity,
    unitId: bid.unitId,
    pricePerUnit: bid.offeredPricePerUnit,
    status: 'awaiting_completion_confirmation',
    createdAt: new Date().toISOString(),
  }
  const savedTxn = await dataLayer.repos.marketplace.saveTransaction(transaction)
  if (!savedTxn.ok) return savedTxn

  await pushNotification({
    userId: bid.buyerUserId,
    title: 'Offer accepted',
    body: 'Stock reserved for this transaction. Confirm completion in My Bids.',
  })

  return ok({ bid: savedBid.data, listing: savedListing.data, transaction: savedTxn.data })
}

export async function confirmTransactionSide(input: {
  userId: string
  transactionId: string
  side: 'buyer' | 'seller'
}): Promise<RepositoryResult<Transaction>> {
  const txns = await dataLayer.repos.marketplace.listTransactions()
  if (!txns.ok) return txns
  const txn = txns.data.find((row) => row.id === input.transactionId)
  if (!txn) return err({ code: 'NOT_FOUND', message: 'Transaction not found.' })
  if (txn.status === 'cancelled' || txn.status === 'completed') {
    return err({ code: 'VALIDATION', message: 'Transaction is already closed.' })
  }

  const now = new Date().toISOString()
  const updated: Transaction = {
    ...txn,
    buyerConfirmedAt: input.side === 'buyer' ? now : txn.buyerConfirmedAt,
    sellerConfirmedAt: input.side === 'seller' ? now : txn.sellerConfirmedAt,
  }

  if (input.side === 'buyer' && txn.buyerUserId !== input.userId) {
    return err({ code: 'FORBIDDEN', message: 'Buyer confirmation only.' })
  }
  if (input.side === 'seller' && txn.sellerUserId !== input.userId) {
    return err({ code: 'FORBIDDEN', message: 'Seller confirmation only.' })
  }

  if (updated.buyerConfirmedAt && updated.sellerConfirmedAt) {
    updated.status = 'completed'
    const listingResult = await dataLayer.repos.marketplace.getListingById(txn.listingId)
    if (!listingResult.ok) return listingResult
    const completedListing = completeListingSale(listingResult.data, txn.quantity, updated)
    if (!completedListing.ok) {
      return err({ code: 'VALIDATION', message: completedListing.error.message, details: completedListing.error.details })
    }
    await dataLayer.repos.marketplace.saveListing(completedListing.data)
  }

  return dataLayer.repos.marketplace.saveTransaction(updated)
}

export async function cancelTransaction(input: {
  userId: string
  transactionId: string
}): Promise<RepositoryResult<Transaction>> {
  const txns = await dataLayer.repos.marketplace.listTransactions()
  if (!txns.ok) return txns
  const txn = txns.data.find((row) => row.id === input.transactionId)
  if (!txn) return err({ code: 'NOT_FOUND', message: 'Transaction not found.' })
  if (txn.status === 'completed') return err({ code: 'VALIDATION', message: 'Completed transaction cannot cancel.' })
  if (input.userId !== txn.buyerUserId && input.userId !== txn.sellerUserId) {
    return err({ code: 'FORBIDDEN', message: 'Only transaction parties can cancel.' })
  }

  const listingResult = await dataLayer.repos.marketplace.getListingById(txn.listingId)
  if (!listingResult.ok) return listingResult
  const released = releaseListingReservation(listingResult.data, txn.quantity)
  if (!released.ok) {
    return err({ code: 'VALIDATION', message: released.error.message, details: released.error.details })
  }
  await dataLayer.repos.marketplace.saveListing(released.data)

  return dataLayer.repos.marketplace.saveTransaction({ ...txn, status: 'cancelled' })
}

export async function createFarmerPriceEntry(input: {
  farmerId: string
  productId: string
  locationId: string
  reportedQuantity: number
  reportedUnitId: string
  reportedTotalPrice: number
}): Promise<RepositoryResult<PriceEntry>> {
  const [products, units] = await Promise.all([
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listUnits(),
  ])
  if (!products.ok) return products
  if (!units.ok) return units

  const product = products.data.find((row) => row.id === input.productId)
  const unit = units.data.find((row) => row.id === input.reportedUnitId)
  if (!product || !unit) return err({ code: 'NOT_FOUND', message: 'Product or unit not found.' })

  const normalized = normalizeMarketPrice({
    product,
    unit,
    reportedQuantity: input.reportedQuantity,
    reportedTotalPrice: input.reportedTotalPrice,
  })
  if (!normalized.ok) {
    return err({
      code: 'VALIDATION',
      message: normalized.error.message,
      details: normalized.error.details,
    })
  }

  const submittedAt = new Date().toISOString()
  const entry: PriceEntry = {
    id: newId('pe'),
    farmerId: input.farmerId,
    submittedByUserId: input.farmerId,
    productId: input.productId,
    locationId: input.locationId,
    reportedQuantity: input.reportedQuantity,
    reportedUnitId: input.reportedUnitId,
    reportedTotalPrice: input.reportedTotalPrice,
    normalizedQuantityKg: normalized.data.normalizedQuantityKg,
    normalizedPricePerKg: normalized.data.normalizedPricePerKg,
    consentStatus: 'not_required',
    approvalStatus: 'pending',
    freshnessStatus: 'active',
    isAssisted: false,
    anomalyFlagged: false,
    submittedAt,
  }

  const saved = await dataLayer.repos.prices.savePriceEntry(entry)
  if (saved.ok) {
    await pushNotification({
      userId: input.farmerId,
      title: 'Price submitted',
      body: 'Observation saved for review.',
    })
  }
  return saved
}

export function estimateSellerMargin(input: {
  purchasePricePerUnit?: number
  sellingPricePerUnit: number
  quantity: number
}) {
  if (input.purchasePricePerUnit === undefined) {
    return {
      estimatedProfit: null as number | null,
      warning: 'Missing purchase cost — profit is illustrative only.',
    }
  }
  const estimatedProfit = (input.sellingPricePerUnit - input.purchasePricePerUnit) * input.quantity
  return { estimatedProfit, warning: null as string | null }
}

export async function loadMarketplaceContext() {
  return Promise.all([
    dataLayer.repos.catalog.listProducts(),
    dataLayer.repos.catalog.listCategories(),
    dataLayer.repos.catalog.listLocations(),
    dataLayer.repos.catalog.listUnits(),
    dataLayer.repos.marketplace.listListings(),
    dataLayer.repos.marketplace.listBids(),
    dataLayer.repos.marketplace.listTransactions(),
    dataLayer.repos.prices.listPriceEntries(),
  ])
}
