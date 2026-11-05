import { Link } from 'react-router-dom'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { HomeMarketProductsSection } from '@/features/home/HomeMarketProductsSection'
import { buttonVariants } from '@/components/ui/button'

export function HomePage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{t('homeTitle')}</h1>
        <p className="max-w-2xl text-lg text-bazardor-muted">{t('homeSubtitle')}</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/explore" className={buttonVariants({ size: 'lg', variant: 'outline' })}>
            {t('exploreMore')}
          </Link>
          <Link to="/login" className={buttonVariants({ size: 'lg' })}>
            {t('demoSignIn')}
          </Link>
        </div>
      </section>

      <section>
        <HomeMarketProductsSection />
      </section>
    </div>
  )
}
