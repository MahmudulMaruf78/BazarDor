import { HomeHeroFeatureSections, HomePageHero } from '@/features/home/HomeHeroSections'
import { HomeMarketProductsSection } from '@/features/home/HomeMarketProductsSection'

export function HomePage() {
  return (
    <div>
      <HomePageHero />

      <HomeHeroFeatureSections />

      <section id="home-market-products" className="w-full scroll-mt-20 px-3 py-8 sm:px-4 md:px-6 lg:px-8 md:py-10">
        <HomeMarketProductsSection />
      </section>
    </div>
  )
}
