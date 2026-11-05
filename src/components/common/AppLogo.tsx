import { Link } from 'react-router-dom'
import { brandAssets } from '@/constants/brand-assets'

type AppLogoProps = {
  compact?: boolean
}

export function AppLogo({ compact }: AppLogoProps) {
  const src = compact ? brandAssets.logoMark : brandAssets.logoHorizontal

  return (
    <Link to="/" className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      <img
        src={src}
        alt="BazarDor"
        className={compact ? 'size-9 shrink-0' : 'h-9 w-auto max-w-[11rem] shrink-0 sm:max-w-[13rem]'}
      />
      <span className="sr-only">BazarDor — agricultural marketplace</span>
    </Link>
  )
}
