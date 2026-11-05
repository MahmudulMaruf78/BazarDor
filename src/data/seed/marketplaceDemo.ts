import type { Category, FarmerProfile, Listing, PriceEntry, Product, User } from '@/types/domain/records'
import { demoProductImageUrl } from '@/constants/demo-product-assets'
import { getBangladeshChildren, selectionFromLocationId } from '@/data/bangladeshLocationIndex'
import { DEMO_LOCATION_IDS as D } from '@/data/demoLocationIds'

const T0 = '2026-11-01T06:00:00+06:00'
const T1 = '2026-11-03T08:00:00+06:00'
const T2 = '2026-11-04T07:30:00+06:00'
const T3 = '2026-11-04T10:00:00+06:00'

function leafForUpazila(upazilaId: string): string {
  return getBangladeshChildren(upazilaId)[0]?.id ?? upazilaId
}

export const demoMarketLocations = {
  savar: leafForUpazila('bd-upz-dhaka-dhaka-savar'),
  gazipur: leafForUpazila('bd-upz-dhaka-gazipur-gazipur-s'),
  singra: leafForUpazila('bd-upz-rajshahi-natore-singra'),
  balaganj: leafForUpazila('bd-upz-sylhet-sylhet-balaganj'),
  anwara: leafForUpazila('bd-upz-chattogram-chattogram-anwara'),
  ghona: D.unionGhona,
  durgapur: D.unionDurgapur,
  jashoreDist: D.districtJashore,
  keshabpur: D.upazilaKeshabpur,
} as const

export const marketplaceCategories: readonly Category[] = [
  { id: 'cat-cereals', nameEn: 'Cereals', nameBn: 'শস্য' },
  { id: 'cat-vegetables', nameEn: 'Vegetables', nameBn: 'সবজি' },
  { id: 'cat-fruits', nameEn: 'Fruits', nameBn: 'ফল' },
  { id: 'cat-pulses', nameEn: 'Pulses', nameBn: 'ডাল' },
  { id: 'cat-spices', nameEn: 'Spices & oilseeds', nameBn: 'মসলা ও তেল শস্য' },
]

const kgMaund = ['unit-kg', 'unit-maund'] as const
const kgMaundQuintal = ['unit-kg', 'unit-maund', 'unit-quintal'] as const

export const marketplaceProducts: readonly Product[] = [
  {
    id: 'prod-paddy',
    categoryId: 'cat-cereals',
    nameEn: 'BR-28 Paddy',
    nameBn: 'বিআর-২৮ ধান',
    allowedUnitIds: [...kgMaundQuintal],
    imageUrl: demoProductImageUrl('prod-paddy'),
  },
  {
    id: 'prod-rice-milled',
    categoryId: 'cat-cereals',
    nameEn: 'Miniket Rice',
    nameBn: 'মিনিকেট চাল',
    allowedUnitIds: [...kgMaundQuintal],
    imageUrl: demoProductImageUrl('prod-rice-milled'),
  },
  {
    id: 'prod-potato',
    categoryId: 'cat-vegetables',
    nameEn: 'Granola Potato',
    nameBn: 'গ্রানোলা আলু',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-potato'),
  },
  {
    id: 'prod-onion',
    categoryId: 'cat-vegetables',
    nameEn: 'Local Red Onion',
    nameBn: 'দেশি লাল পেঁয়াজ',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-onion'),
  },
  {
    id: 'prod-tomato',
    categoryId: 'cat-vegetables',
    nameEn: 'Round Tomato',
    nameBn: 'গোল টমেটো',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-tomato'),
  },
  {
    id: 'prod-brinjal',
    categoryId: 'cat-vegetables',
    nameEn: 'Long Brinjal',
    nameBn: 'লম্বা বেগুন',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-brinjal'),
  },
  {
    id: 'prod-chili',
    categoryId: 'cat-spices',
    nameEn: 'Green Chili',
    nameBn: 'কাঁচা মরিচ',
    allowedUnitIds: ['unit-kg'],
    imageUrl: demoProductImageUrl('prod-chili'),
  },
  {
    id: 'prod-mustard',
    categoryId: 'cat-spices',
    nameEn: 'Mustard Seed',
    nameBn: 'সরিষা',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-mustard'),
  },
  {
    id: 'prod-mango',
    categoryId: 'cat-fruits',
    nameEn: 'Langra Mango',
    nameBn: 'ল্যাংরা আম',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-mango'),
  },
  {
    id: 'prod-banana',
    categoryId: 'cat-fruits',
    nameEn: 'Sabri Banana',
    nameBn: 'সাবরি কলা',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-banana'),
  },
  {
    id: 'prod-lentil',
    categoryId: 'cat-pulses',
    nameEn: 'Red Lentil (Moshur)',
    nameBn: 'মসুর ডাল',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-lentil'),
  },
  {
    id: 'prod-garlic',
    categoryId: 'cat-spices',
    nameEn: 'Local Garlic',
    nameBn: 'দেশি রসুন',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-garlic'),
  },
  {
    id: 'prod-ginger',
    categoryId: 'cat-spices',
    nameEn: 'Local Ginger',
    nameBn: 'দেশি আদা',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-ginger'),
  },
  {
    id: 'prod-cabbage',
    categoryId: 'cat-vegetables',
    nameEn: 'Green Cabbage',
    nameBn: 'সবুজ বাঁধাকপি',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-cabbage'),
  },
  {
    id: 'prod-cucumber',
    categoryId: 'cat-vegetables',
    nameEn: 'Hybrid Cucumber',
    nameBn: 'হাইব্রিড শসা',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-cucumber'),
  },
  {
    id: 'prod-turmeric',
    categoryId: 'cat-spices',
    nameEn: 'Turmeric (fresh root)',
    nameBn: 'কাঁচা হলুদ',
    allowedUnitIds: [...kgMaund],
    imageUrl: demoProductImageUrl('prod-turmeric'),
  },
]

export const marketplaceExtraUsers: readonly User[] = [
  {
    id: 'user-farmer-5',
    role: 'farmer',
    displayName: 'Nasir Hossain',
    phonePlaceholder: '01XX-XXX-0005',
    farmerProfileId: 'fp-nasir',
    createdAt: T0,
  },
  {
    id: 'user-farmer-6',
    role: 'farmer',
    displayName: 'Fatema Khatun',
    phonePlaceholder: '01XX-XXX-0006',
    farmerProfileId: 'fp-fatema',
    createdAt: T0,
  },
  {
    id: 'user-seller-2',
    role: 'seller',
    displayName: 'Dhaka Agro Supply',
    phonePlaceholder: '01XX-XXX-0202',
    createdAt: T0,
  },
  {
    id: 'user-seller-3',
    role: 'seller',
    displayName: 'Sylhet Hills Trade',
    phonePlaceholder: '01XX-XXX-0203',
    createdAt: T0,
  },
]

function farmerProfileFromLeaf(
  id: string,
  userId: string,
  displayNameBn: string,
  leafId: string,
  qrProfileId: string,
): FarmerProfile {
  const sel = selectionFromLocationId(leafId)
  return {
    id,
    userId,
    displayNameBn,
    locationId: leafId,
    divisionId: sel?.divisionId,
    districtId: sel?.districtId,
    upazilaId: sel?.upazilaId,
    unionId: sel?.unionId,
    hasPhone: true,
    qrProfileId,
  }
}

export const marketplaceExtraFarmerProfiles: readonly FarmerProfile[] = [
  farmerProfileFromLeaf('fp-nasir', 'user-farmer-5', 'নাসির হোসেন', demoMarketLocations.savar, 'demo-fp-nasir'),
  farmerProfileFromLeaf('fp-fatema', 'user-farmer-6', 'ফাতেমা খাতুন', demoMarketLocations.balaganj, 'demo-fp-fatema'),
]

function listing(
  id: string,
  sellerUserId: string,
  productId: string,
  locationId: string,
  qty: number,
  available: number,
  price: number,
  createdAt: string,
): Listing {
  return {
    id,
    sellerUserId,
    productId,
    locationId,
    quantity: qty,
    unitId: 'unit-kg',
    availableQuantity: available,
    reservedQuantity: 0,
    completedQuantity: qty - available,
    askingPricePerUnit: price,
    status: available > 0 ? 'active' : 'sold_out',
    demoLabel: 'Demo',
    createdAt,
  }
}

export const marketplaceExtraListings: readonly Listing[] = [
  listing('list-dhaka-tomato', 'user-seller-2', 'prod-tomato', demoMarketLocations.savar, 400, 360, 45, T1),
  listing('list-dhaka-garlic', 'user-seller-2', 'prod-garlic', demoMarketLocations.gazipur, 150, 140, 210, T2),
  listing('list-dhaka-rice', 'user-farmer-5', 'prod-rice-milled', demoMarketLocations.savar, 600, 520, 62, T1),
  listing('list-raj-lentil', 'user-seller-1', 'prod-lentil', demoMarketLocations.singra, 300, 280, 95, T2),
  listing('list-raj-mustard', 'user-farmer-1', 'prod-mustard', demoMarketLocations.singra, 200, 180, 88, T3),
  listing('list-syl-mango', 'user-seller-3', 'prod-mango', demoMarketLocations.balaganj, 250, 230, 55, T1),
  listing('list-syl-banana', 'user-farmer-6', 'prod-banana', demoMarketLocations.balaganj, 180, 160, 42, T2),
  listing('list-ctg-chili', 'user-seller-2', 'prod-chili', demoMarketLocations.anwara, 80, 70, 120, T2),
  listing('list-ctg-brinjal', 'user-seller-1', 'prod-brinjal', demoMarketLocations.anwara, 350, 300, 32, T1),
  listing('list-khul-paddy', 'user-farmer-2', 'prod-paddy', demoMarketLocations.ghona, 900, 800, 81, T1),
  listing('list-khul-potato-2', 'user-farmer-3', 'prod-potato', demoMarketLocations.keshabpur, 450, 400, 36, T2),
  listing('list-khul-onion-2', 'user-seller-1', 'prod-onion', demoMarketLocations.durgapur, 220, 200, 65, T3),
  listing('list-dhaka-paddy', 'user-farmer-5', 'prod-paddy', demoMarketLocations.gazipur, 500, 480, 79, T0),
  listing('list-raj-rice', 'user-seller-1', 'prod-rice-milled', demoMarketLocations.singra, 400, 350, 64, T1),
  listing('list-syl-lentil', 'user-seller-3', 'prod-lentil', demoMarketLocations.balaganj, 120, 100, 92, T3),
  listing('list-ctg-potato', 'user-seller-2', 'prod-potato', demoMarketLocations.anwara, 600, 550, 39, T0),
  listing('list-dhaka-brinjal', 'user-farmer-5', 'prod-brinjal', demoMarketLocations.savar, 280, 260, 28, T2),
  listing('list-raj-tomato', 'user-farmer-4', 'prod-tomato', demoMarketLocations.singra, 320, 300, 44, T1),
  listing('list-syl-chili', 'user-farmer-6', 'prod-chili', demoMarketLocations.balaganj, 60, 55, 115, T2),
  listing('list-khul-garlic', 'user-farmer-1', 'prod-garlic', demoMarketLocations.ghona, 90, 80, 205, T3),
  listing('list-dhaka-mango', 'user-seller-2', 'prod-mango', demoMarketLocations.gazipur, 140, 120, 58, T2),
  listing('list-raj-banana', 'user-farmer-2', 'prod-banana', demoMarketLocations.singra, 100, 90, 40, T3),
  listing('list-ctg-mustard', 'user-farmer-3', 'prod-mustard', demoMarketLocations.anwara, 175, 160, 90, T1),
  listing('list-syl-rice', 'user-seller-3', 'prod-rice-milled', demoMarketLocations.balaganj, 700, 650, 63, T0),
  listing('list-dhaka-lentil', 'user-seller-2', 'prod-lentil', demoMarketLocations.savar, 110, 95, 98, T3),
  listing('list-raj-garlic', 'user-seller-1', 'prod-garlic', demoMarketLocations.singra, 130, 115, 208, T2),
  listing('list-khul-tomato', 'user-farmer-4', 'prod-tomato', demoMarketLocations.durgapur, 260, 240, 46, T1),
  listing('list-ctg-rice', 'user-seller-2', 'prod-rice-milled', demoMarketLocations.anwara, 550, 500, 61, T2),
  listing('list-syl-mustard', 'user-farmer-6', 'prod-mustard', demoMarketLocations.balaganj, 190, 170, 86, T1),
  listing('list-dhaka-chili', 'user-farmer-5', 'prod-chili', demoMarketLocations.gazipur, 45, 40, 118, T3),
  listing('list-dhaka-ginger', 'user-seller-2', 'prod-ginger', demoMarketLocations.savar, 95, 85, 175, T1),
  listing('list-dhaka-cabbage', 'user-farmer-5', 'prod-cabbage', demoMarketLocations.gazipur, 320, 290, 22, T2),
  listing('list-raj-cucumber', 'user-farmer-4', 'prod-cucumber', demoMarketLocations.singra, 240, 220, 38, T1),
  listing('list-syl-turmeric', 'user-farmer-6', 'prod-turmeric', demoMarketLocations.balaganj, 70, 65, 145, T2),
  listing('list-ctg-ginger', 'user-seller-2', 'prod-ginger', demoMarketLocations.anwara, 110, 100, 168, T3),
  listing('list-khul-cabbage', 'user-farmer-3', 'prod-cabbage', demoMarketLocations.keshabpur, 280, 250, 24, T1),
  listing('list-raj-turmeric', 'user-seller-1', 'prod-turmeric', demoMarketLocations.singra, 55, 50, 142, T3),
]

function priceEntry(
  id: string,
  farmerId: string,
  productId: string,
  locationId: string,
  kgPrice: number,
  submittedAt: string,
): PriceEntry {
  return {
    id,
    farmerId,
    submittedByUserId: farmerId,
    productId,
    locationId,
    reportedQuantity: 1,
    reportedUnitId: 'unit-maund',
    reportedTotalPrice: kgPrice * 40,
    normalizedQuantityKg: 40,
    normalizedPricePerKg: kgPrice,
    consentStatus: 'not_required',
    approvalStatus: 'approved',
    freshnessStatus: 'active',
    isAssisted: false,
    anomalyFlagged: false,
    submittedAt,
    approvedAt: submittedAt,
    expiresAt: '2026-11-05T08:00:00+06:00',
    demoLabel: 'Demo',
  }
}

export const marketplaceExtraPriceEntries: readonly PriceEntry[] = [
  priceEntry('pe-dhaka-paddy-nasir', 'user-farmer-5', 'prod-paddy', demoMarketLocations.savar, 78, T1),
  priceEntry('pe-dhaka-paddy-nasir-2', 'user-farmer-5', 'prod-paddy', demoMarketLocations.gazipur, 80, T2),
  priceEntry('pe-dhaka-rice-trader', 'user-farmer-5', 'prod-rice-milled', demoMarketLocations.savar, 61, T2),
  priceEntry('pe-raj-paddy-farmer1', 'user-farmer-1', 'prod-paddy', demoMarketLocations.singra, 77, T1),
  priceEntry('pe-raj-paddy-farmer4', 'user-farmer-4', 'prod-paddy', demoMarketLocations.singra, 79, T2),
  priceEntry('pe-syl-paddy-fatema', 'user-farmer-6', 'prod-paddy', demoMarketLocations.balaganj, 76, T1),
  priceEntry('pe-syl-paddy-fatema-2', 'user-farmer-6', 'prod-paddy', demoMarketLocations.balaganj, 78, T3),
  priceEntry('pe-khul-tomato-habib', 'user-farmer-4', 'prod-tomato', demoMarketLocations.durgapur, 44, T2),
  priceEntry('pe-ctg-potato-seller', 'user-seller-2', 'prod-potato', demoMarketLocations.anwara, 37, T1),
]
