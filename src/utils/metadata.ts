import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localePath } from './locales';

// Hardcoded rather than derived from NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
// that system variable is only injected when Vercel is configured to expose it,
// and an undefined origin would emit a canonical pointing at https://undefined/.
export const SITE_ORIGIN = 'https://qoodish.com';

const DEFAULT_OG_IMAGES = {
  en: 'https://storage.googleapis.com/qoodish.appspot.com/assets/ogp-image-en-2023-09-12.webp',
  ja: 'https://storage.googleapis.com/qoodish.appspot.com/assets/ogp-image-ja-2023-09-12.webp'
} as const;

export function defaultOgImage(lang: string): string {
  return lang === 'en' ? DEFAULT_OG_IMAGES.en : DEFAULT_OG_IMAGES.ja;
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
