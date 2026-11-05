import { Link } from 'react-router-dom'
import { MapPinned, Scale, UsersRound } from 'lucide-react'
import { useI18n } from '@/app/preferences/LocaleProvider'
import { HOME_HERO_PRIMARY } from '@/constants/home-hero-assets'
import { buttonVariants } from '@/components/ui/button'
import { cn } from 'cn'

function HomeHeroAsidePanel({ className }: { className?: string }) {
  const { t } = useI18n()
  const lines = [
    { key: 'homeHeroPanelExplore' as const, icon: MapPinned, text: t('homeHeroPanelExplore') },
    { key: 'homeHeroPanelPrices' as const, icon: Scale, text: t('homeHeroPanelPrices') },
    { key: 'homeHeroPanelRoles' as const, icon: UsersRound, text: t('homeHeroPanelRoles') },
  ] as const

  return (
    <div
      className={cn(
        'rounded-xl border border-white/25 bg-card/90 p-5 shadow-lg backdrop-blur-md',
        className,
      )}
    >
      <p className="text-sm font-semibold text-primary">{t('homeHeroPanelTitle')}</p>
      <ul className="mt-4 space-y-3">
        {lines.map(({ key, icon: Icon, text }) => (
          <li key={key} className="flex gap-3 text-sm text-muted-foreground">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" aria-hidden />
            </span>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function HomePageHero() {
  const { t } = useI18n()

  return (
    <section className="relative isolate min-h-[min(520px,85vh)] overflow-hidden border-b border-primary/25">
      <picture className="absolute inset-0 block size-full">
        <source media="(max-width: 767px)" srcSet={HOME_HERO_PRIMARY.mobileSrc} />
        <img
          src={HOME_HERO_PRIMARY.src}
          alt={t(HOME_HERO_PRIMARY.altKey)}
          className={cn('size-full object-cover', HOME_HERO_PRIMARY.objectPosition)}
          loading="eager"
          fetchPriority="high"
          decoding="async"
          width={1920}
          height={1280}
        />
      </picture>
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/96 via-background/88 to-background/35 md:from-background/94 md:via-primary/72 md:to-primary/15"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/75 via-transparent to-black/10"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[min(520px,85vh)] max-w-6xl flex-col justify-center px-4 py-10 sm:py-12 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,380px)] lg:items-center">
          <div className="max-w-2xl space-y-4">
            <h1 className="text-3xl font-semibold tracking-tight text-primary md:text-4xl lg:text-[2.5rem] lg:leading-tight">
              {t('homeTitle')}
            </h1>
            <p className="text-base text-foreground/90 md:text-lg">{t('homeSubtitle')}</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/explore"
                className={buttonVariants({
                  size: 'default',
                  variant: 'outline',
                  className: 'border-primary/40 bg-card/95 hover:bg-primary/10 hover:text-primary',
                })}
              >
                {t('exploreMore')}
              </Link>
              <Link to="/login" className={buttonVariants({ size: 'default' })}>
                {t('demoSignIn')}
              </Link>
            </div>
          </div>
          <HomeHeroAsidePanel className="max-lg:max-w-xl" />
        </div>
      </div>
    </section>
  )
}

const featureCards = [
  {
    titleKey: 'homeHeroSectionExploreTitle' as const,
    descKey: 'homeHeroSectionExploreDesc' as const,
    ctaKey: 'exploreMore' as const,
    to: '/explore',
  },
  {
    titleKey: 'homeHeroSectionCatalogTitle' as const,
    descKey: 'homeHeroSectionCatalogDesc' as const,
    ctaKey: 'sampleProducts' as const,
    to: '#home-market-products',
  },
  {
    titleKey: 'homeHeroSectionSignInTitle' as const,
    descKey: 'homeHeroSectionSignInDesc' as const,
    ctaKey: 'demoSignIn' as const,
    to: '/login',
  },
] as const

export function HomeHeroFeatureSections() {
  const { t } = useI18n()

  return (
    <section
      className="border-b border-primary/15 bg-gradient-to-b from-secondary/50 via-background to-background"
      aria-labelledby="home-hero-features-heading"
    >
      <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
        <h2 id="home-hero-features-heading" className="sr-only">
          {t('homeHeroFeaturesHeading')}
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featureCards.map((card, index) => (
            <article
              key={card.titleKey}
              className={cn(
                'flex flex-col rounded-xl border border-primary/20 bg-card/90 p-5 shadow-sm',
                'bg-gradient-to-br from-card via-card to-primary/[0.06]',
              )}
            >
              <h3 className="text-base font-semibold text-foreground">{t(card.titleKey)}</h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{t(card.descKey)}</p>
              <Link
                to={card.to}
                className={buttonVariants({
                  variant: index === 0 ? 'default' : 'outline',
                  size: 'sm',
                  className: cn('mt-4 w-fit', index !== 0 && 'border-primary/30'),
                })}
              >
                {t(card.ctaKey)}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
