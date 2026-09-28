import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { BRAND_COLOR } from '../utils/brand.ts';
import { getDictionary } from '../utils/getDictionary.ts';
import { preferredLocale } from '../utils/locales.ts';

const START_URL = '/?utm_source=homescreen';

const ICON_SIZES = ['48', '72', '96', '128', '192', '384', '512'] as const;

const ICON_PURPOSES = ['any', 'maskable'] as const;

const icons: MetadataRoute.Manifest['icons'] = ICON_SIZES.flatMap((size) =>
  ICON_PURPOSES.map((purpose) => ({
    src: `/icons/icon_x${size}.png`,
    sizes: `${size}x${size}`,
    type: 'image/png',
    purpose
  }))
);

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const headersList = await headers();
  const lang = preferredLocale(headersList.get('accept-language'));
  const dict = getDictionary(lang);

  return {
    id: START_URL,
    name: 'Qoodish',
    short_name: 'Qoodish',
    description: dict['meta description'],
    lang,
    start_url: START_URL,
    scope: '/',
    display: 'standalone',
    theme_color: BRAND_COLOR,
    background_color: '#ffffff',
    categories: ['travel', 'navigation', 'social'],
    icons,
    shortcuts: [
      { name: dict.discover, url: '/discover' },
      { name: dict['journey log'], url: '/journeys' },
      { name: dict.bookmarks, url: '/bookmarks' },
      { name: dict.notifications, url: '/notifications' }
    ]
  };
}
