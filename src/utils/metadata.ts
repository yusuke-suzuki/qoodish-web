import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localePath } from './locales.ts';

export const SITE_ORIGIN = 'https://qoodish.com';

const DEFAULT_OG_IMAGES = {
  en: 'https://storage.googleapis.com/qoodish.appspot.com/assets/ogp-image-en-2023-09-12.webp',
  ja: 'https://storage.googleapis.com/qoodish.appspot.com/assets/ogp-image-ja-2023-09-12.webp'
} as const;

export function defaultOgImage(lang: string): string {
  return lang === 'en' ? DEFAULT_OG_IMAGES.en : DEFAULT_OG_IMAGES.ja;
}

// Both the static fallback assets and the Cloudflare Images "ogp" variant are
// rendered at 1200x630.
export function ogImages(
  url: string
): { url: string; width: number; height: number }[] {
  return [{ url, width: 1200, height: 630 }];
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
