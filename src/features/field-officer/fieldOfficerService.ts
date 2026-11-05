import { dataLayer } from '@/data'
import { consentDisplayLabel } from '@/services/consentService'
import {
  buildApprovedEntry,
  buildRejectedEntry,
  canApprovePriceEntry,
  canRejectPriceEntry,
} from '@/services/approvalService'
import { computeExpiresAt } from '@/services/expiryService'
import { normalizeMarketPrice } from '@/services/priceNormalization'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'
import { expandLocationScope } from '@/services/locationScope'
import type { AuditLogEntry, FarmerProfile, PriceEntry } from '@/types/domain/records'
import { err, ok, type RepositoryResult } from '@/types/result'

const ASSIGNED_SCOPE = D.districtJashore

function newId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`
}

async function appendAudit(input: Omit<AuditLogEntry, 'id' | 'at' | 'entityType'>) {
  const entry: AuditLogEntry = {
    id: newId('audit'),
    entityType: 'priceEntry',
    at: new Date().toISOString(),
    ...input,
  }
  await dataLayer.repos.auditLogs.saveAuditLog(entry)
}

export async function listAssignedFarmers(): Promise<
  RepositoryResult<Array<FarmerProfile & { displayName: string; consentLabel?: string }>>
> {
  const [profiles, users, locations] = await Promise.all([
    dataLayer.repos.users.listFarmerProfiles(),
    dataLayer.repos.users.listUsers(),
    dataLayer.repos.catalog.listLocations(),
  ])
  if (!profiles.ok) return profiles
  if (!users.ok) return users
  if (!locations.ok) return locations

  const scope = new Set(expandLocationScope(ASSIGNED_SCOPE, locations.data))
  const userMap = new Map(users.data.map((user) => [user.id, user.displayName]))

  return ok(
    profiles.data
      .filter((profile) => scope.has(profile.locationId))
      .map((profile) => ({
        ...profile,
        displayName: userMap.get(profile.userId) ?? profile.userId,
      })),
  )
}

export async function createAssistedPriceEntry(input: {
  officerUserId: string
  farmerId: string
  productId: string
  locationId: string
  reportedQuantity: number
  reportedUnitId: string
  reportedTotalPrice: number
}): Promise<RepositoryResult<PriceEntry>> {
  const profiles = await dataLayer.repos.users.listFarmerProfiles()
  if (!profiles.ok) return profiles
  const profile = profiles.data.find((row) => row.userId === input.farmerId)
  if (!profile) return err({ code: 'NOT_FOUND', message: 'Farmer profile not found.' })

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
    return err({ code: 'VALIDATION', message: normalized.error.message, details: normalized.error.details })
  }

  const consentStatus = profile.hasPhone ? 'pending' : 'unavailable'

  const entry: PriceEntry = {
    id: newId('pe'),
    farmerId: input.farmerId,
    submittedByUserId: input.officerUserId,
    productId: input.productId,
    locationId: input.locationId,
    reportedQuantity: input.reportedQuantity,
    reportedUnitId: input.reportedUnitId,
    reportedTotalPrice: input.reportedTotalPrice,
    normalizedQuantityKg: normalized.data.normalizedQuantityKg,
    normalizedPricePerKg: normalized.data.normalizedPricePerKg,
    consentStatus,
    approvalStatus: 'pending',
    freshnessStatus: 'active',
    isAssisted: true,
    anomalyFlagged: false,
    submittedAt: new Date().toISOString(),
    demoLabel: 'Demo',
  }

  const saved = await dataLayer.repos.prices.savePriceEntry(entry)
  if (saved.ok) {
    await appendAudit({
      entityId: saved.data.id,
      action: 'assisted_entry_created',
      actorUserId: input.officerUserId,
      note: consentDisplayLabel(saved.data, profile.hasPhone),
    })
  }
  return saved
}

export async function verifyDemoConsent(entryId: string, officerUserId: string): Promise<RepositoryResult<PriceEntry>> {
  const entries = await dataLayer.repos.prices.listPriceEntries()
  if (!entries.ok) return entries
  const entry = entries.data.find((row) => row.id === entryId)
  if (!entry) return err({ code: 'NOT_FOUND', message: 'Entry not found.' })
  if (entry.consentStatus === 'unavailable') {
    return err({ code: 'VALIDATION', message: 'Consent Not Available for this farmer.' })
  }
  if (entry.consentStatus === 'verified') return ok(entry)

  const updated: PriceEntry = { ...entry, consentStatus: 'verified' }
  const saved = await dataLayer.repos.prices.savePriceEntry(updated)
  if (saved.ok) {
    await appendAudit({
      entityId: entryId,
      action: 'consent_verified_demo',
      actorUserId: officerUserId,
      note: 'Demo OTP marked verified — not real SMS.',
    })
  }
  return saved
}

export async function listVerificationQueue(): Promise<RepositoryResult<PriceEntry[]>> {
  const entries = await dataLayer.repos.prices.listPriceEntries()
  if (!entries.ok) return entries
  return ok(entries.data.filter((entry) => entry.approvalStatus === 'pending'))
}

export async function approveVerificationEntry(
  entryId: string,
  approverUserId: string,
): Promise<RepositoryResult<PriceEntry>> {
  const entries = await dataLayer.repos.prices.listPriceEntries()
  if (!entries.ok) return entries
  const entry = entries.data.find((row) => row.id === entryId)
  if (!entry) return err({ code: 'NOT_FOUND', message: 'Entry not found.' })

  const allowed = canApprovePriceEntry(entry, approverUserId)
  if (!allowed.ok) {
    return err({ code: 'FORBIDDEN', message: allowed.error.message, details: allowed.error.details })
  }

  const approvedAt = new Date().toISOString()
  const approved = buildApprovedEntry(entry, approvedAt, computeExpiresAt(approvedAt))
  const saved = await dataLayer.repos.prices.savePriceEntry(approved)
  if (saved.ok) {
    await appendAudit({
      entityId: entryId,
      action: 'approved',
      actorUserId: approverUserId,
    })
  }
  return saved
}

export async function rejectVerificationEntry(
  entryId: string,
  approverUserId: string,
  reason: string,
): Promise<RepositoryResult<PriceEntry>> {
  const entries = await dataLayer.repos.prices.listPriceEntries()
  if (!entries.ok) return entries
  const entry = entries.data.find((row) => row.id === entryId)
  if (!entry) return err({ code: 'NOT_FOUND', message: 'Entry not found.' })

  const canReject = canRejectPriceEntry(entry)
  if (!canReject.ok) {
    return err({ code: 'VALIDATION', message: canReject.error.message })
  }
  if (entry.submittedByUserId === approverUserId) {
    return err({ code: 'FORBIDDEN', message: 'Field officer cannot approve an entry they submitted.' })
  }

  const rejected = buildRejectedEntry(entry, reason, new Date().toISOString())
  if (!rejected.ok) {
    return err({ code: 'VALIDATION', message: rejected.error.message })
  }
  const saved = await dataLayer.repos.prices.savePriceEntry(rejected.data)
  if (saved.ok) {
    await appendAudit({
      entityId: entryId,
      action: 'rejected',
      actorUserId: approverUserId,
      note: reason,
    })
  }
  return saved
}

export async function listAuditTrailForEntry(entryId: string): Promise<RepositoryResult<AuditLogEntry[]>> {
  const logs = await dataLayer.repos.auditLogs.listAuditLogs()
  if (!logs.ok) return logs
  return ok(logs.data.filter((log) => log.entityId === entryId).sort((a, b) => Date.parse(b.at) - Date.parse(a.at)))
}

export function assignedAreaLabel() {
  return 'Jashore District (demo assigned area)'
}

export async function registerAssistedFarmer(input: {
  officerUserId: string
  displayName: string
  displayNameBn: string
  locationId: string
  divisionId?: string
  districtId?: string
  upazilaId?: string
  unionId?: string
  hasPhone: boolean
}): Promise<RepositoryResult<FarmerProfile & { displayName: string }>> {
  const locations = await dataLayer.repos.catalog.listLocations()
  if (!locations.ok) return locations
  const scope = new Set(expandLocationScope(ASSIGNED_SCOPE, locations.data))
  if (!scope.has(input.locationId)) {
    return err({ code: 'VALIDATION', message: 'Location is outside the officer assigned area.' })
  }
  if (!input.displayName.trim() || !input.displayNameBn.trim()) {
    return err({ code: 'VALIDATION', message: 'Display name (EN/BN) is required.' })
  }

  const userId = newId('user-farmer')
  const profileId = newId('fp')
  const qrProfileId = `demo-${crypto.randomUUID().slice(0, 8)}`
  const suffix = crypto.randomUUID().slice(0, 4)
  const createdAt = new Date().toISOString()

  const user = {
    id: userId,
    role: 'farmer' as const,
    displayName: `${input.displayName.trim()} (Demo)`,
    phonePlaceholder: `01XX-XXX-${suffix}`,
    farmerProfileId: profileId,
    createdAt,
  }

  const profile: FarmerProfile = {
    id: profileId,
    userId,
    displayNameBn: input.displayNameBn.trim(),
    locationId: input.locationId,
    divisionId: input.divisionId,
    districtId: input.districtId,
    upazilaId: input.upazilaId,
    unionId: input.unionId,
    hasPhone: input.hasPhone,
    qrProfileId,
  }

  const savedUser = await dataLayer.repos.users.saveUser(user)
  if (!savedUser.ok) return savedUser
  const savedProfile = await dataLayer.repos.users.saveFarmerProfile(profile)
  if (!savedProfile.ok) return savedProfile

  await appendAudit({
    entityId: savedProfile.data.id,
    action: 'assisted_farmer_registered',
    actorUserId: input.officerUserId,
    note: 'Demo assisted registration — fictional identity only.',
  })

  return ok({ ...savedProfile.data, displayName: savedUser.data.displayName })
}

export async function lookupFarmerByQrProfileId(
  qrProfileId: string,
): Promise<RepositoryResult<FarmerProfile & { displayName: string }>> {
  const trimmed = qrProfileId.trim()
  if (!trimmed) return err({ code: 'VALIDATION', message: 'Profile id is required.' })
  if (/^01\d/.test(trimmed)) {
    return err({ code: 'VALIDATION', message: 'QR must use demo profile id — not a phone number.' })
  }

  const [profiles, users] = await Promise.all([
    dataLayer.repos.users.listFarmerProfiles(),
    dataLayer.repos.users.listUsers(),
  ])
  if (!profiles.ok) return profiles
  if (!users.ok) return users

  const profile = profiles.data.find((row) => row.qrProfileId === trimmed)
  if (!profile) return err({ code: 'NOT_FOUND', message: 'No farmer profile matches this id.' })

  const user = users.data.find((row) => row.id === profile.userId)
  return ok({ ...profile, displayName: user?.displayName ?? profile.userId })
}
