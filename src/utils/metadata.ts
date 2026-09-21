import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localePath } from './locales.ts';
import { imageUrl } from './photos.ts';

export const SITE_ORIGIN = 'https://qoodish.com';

// The cards live on the image host, which assigns an id at upload, so a
// regenerated card is a new id here rather than a new file name. A crawler
// caches a card by its URL, and the id is what makes that URL new.
const OG_IMAGE_IDS = {
  en: '8ca738eb-0789-4633-35b5-0b361b3aff00',
  ja: '494350c9-9840-4e72-c1b9-c6cc597f4000'
} as const;

// Anything that is not English shares the Japanese card, which is the rule
// the pages have always followed.
export function defaultOgImage(lang: string): string {
  return imageUrl(lang === 'en' ? OG_IMAGE_IDS.en : OG_IMAGE_IDS.ja, 'ogp');
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
