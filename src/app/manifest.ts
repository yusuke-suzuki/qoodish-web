import type { MetadataRoute } from 'next';
import { cookies, headers } from 'next/headers';
import { BRAND_COLOR } from '../utils/brand.ts';
import { getDictionary } from '../utils/getDictionary.ts';
import {
  LOCALE_COOKIE,
  localePath,
  rememberedOrPreferredLocale
} from '../utils/locales.ts';
import { manifestScreenshots } from '../utils/manifestScreenshots.ts';

const APP_ID = '/?utm_source=homescreen';

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
  const [headersList, cookieStore] = await Promise.all([headers(), cookies()]);
  const lang = rememberedOrPreferredLocale(
    cookieStore.get(LOCALE_COOKIE)?.value,
    headersList.get('accept-language')
  );
  const dict = getDictionary(lang);

  return {
    id: APP_ID,
    name: 'Qoodish',
    short_name: 'Qoodish',
    description: dict['meta description'],
    lang,
    start_url: `${localePath(lang)}?utm_source=homescreen`,
    scope: '/',
    display: 'standalone',
    theme_color: BRAND_COLOR,
    background_color: '#ffffff',
    categories: ['travel', 'navigation', 'social'],
    icons,
    screenshots: manifestScreenshots(lang),
    shortcuts: [
      { name: dict.discover, url: localePath(lang, '/discover') },
      { name: dict['journey log'], url: localePath(lang, '/journeys') },
      { name: dict.bookmarks, url: localePath(lang, '/bookmarks') },
      { name: dict.notifications, url: localePath(lang, '/notifications') }
    ]
  };
}
