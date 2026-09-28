import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localePath } from './locales.ts';

export const SITE_ORIGIN = 'https://qoodish.com';

// A crawler caches a card by its URL, so each file name carries a hash of
// its content: a regenerated card has to be saved under a new name.
const OG_IMAGE_PATHS = {
  en: '/og/en-01ebddd5.jpg',
  ja: '/og/ja-7e65411a.jpg'
} as const;

// Anything that is not English shares the Japanese card, which is the rule
// the pages have always followed.
export function defaultOgImage(lang: string): string {
  return `${SITE_ORIGIN}${lang === 'en' ? OG_IMAGE_PATHS.en : OG_IMAGE_PATHS.ja}`;
}

// Every image a page shares is the host's "ogp" variant, which is rendered at
// 1200x630. Stating the size lets a crawler draw the large card on the first
// share instead of a small one while it measures the image.
export function ogImages(
  url: string,
  alt: string
): { url: string; width: number; height: number; alt: string }[] {
  return [{ url, width: 1200, height: 630, alt }];
}

export function buildAlternates(
  lang: string,
  path = ''
): Metadata['alternates'] {
  return {
    canonical: localePath(lang, path),
    languages: {
      en: localePath('en', path),
      ja: localePath('ja', path),
      'x-default': localePath(DEFAULT_LOCALE, path)
    }
  };
}
