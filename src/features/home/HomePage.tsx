import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { HomeMarketProductsSection } from '@/features/home/HomeMarketProductsSection'
import { buttonVariants } from '@/components/ui/button'

export function HomePage() {
  const { t } = useI18n()

  return (
    <div>
      <section className="border-b border-border/80 bg-white">
        <div className="mx-auto max-w-6xl space-y-4 px-4 py-10 md:py-12">
          <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-bazardor-navy md:text-4xl">
            {t('homeTitle')}
          </h1>
          <p className="max-w-2xl text-base text-bazardor-muted md:text-lg">{t('homeSubtitle')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/explore" className={buttonVariants({ size: 'default', variant: 'outline' })}>
              {t('exploreMore')}
            </Link>
            <Link to="/login" className={buttonVariants({ size: 'default' })}>
              {t('demoSignIn')}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <HomeMarketProductsSection />
      </section>
    </div>
  )
}
