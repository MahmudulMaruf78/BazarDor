/** Homepage hero photography — paths under `public/home-hero/`. Re-fetch: `node scripts/fetch-home-hero-images.mjs` */
export const HOME_HERO_PRIMARY = {
  src: '/home-hero/hero-primary.jpg',
  mobileSrc: '/home-hero/hero-primary-mobile.jpg',
  altKey: 'homeHeroPhotoPrimaryAlt' as const,
  /** ponytail: tuned for subject on right, copy on left */
  objectPosition: 'object-[68%_42%] md:object-[78%_center]',
} as const

export const HOME_HERO_SUPPORTING = {
  src: '/home-hero/hero-supporting.jpg',
  altKey: 'homeHeroPhotoSupportingAlt' as const,
} as const
