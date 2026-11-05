/** Fixed paths under `public/demo-products/` — marketing replaces PNGs without code changes. */
export const demoProductImages = {
  'prod-paddy': '/demo-products/paddy.png',
  'prod-rice-milled': '/demo-products/rice-milled.png',
  'prod-potato': '/demo-products/potato.png',
  'prod-onion': '/demo-products/onion.png',
  'prod-tomato': '/demo-products/tomato.png',
  'prod-brinjal': '/demo-products/brinjal.png',
  'prod-chili': '/demo-products/chili.png',
  'prod-mustard': '/demo-products/mustard.png',
  'prod-mango': '/demo-products/mango.png',
  'prod-banana': '/demo-products/banana.png',
  'prod-lentil': '/demo-products/lentil.png',
  'prod-garlic': '/demo-products/garlic.png',
  'prod-ginger': '/demo-products/ginger.png',
  'prod-cabbage': '/demo-products/cabbage.png',
  'prod-cucumber': '/demo-products/cucumber.png',
  'prod-turmeric': '/demo-products/turmeric.png',
} as const

export type DemoProductId = keyof typeof demoProductImages

export function demoProductImageUrl(productId: string): string {
  return demoProductImages[productId as DemoProductId] ?? '/demo-products/placeholder.svg'
}
