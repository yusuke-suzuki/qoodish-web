import type { Metadata } from 'next';
import { DEFAULT_LOCALE, localePath } from './locales';

// Hardcoded rather than derived from NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL:
// that system variable is only injected when Vercel is configured to expose it,
// and an undefined origin would emit a canonical pointing at https://undefined/.
export const SITE_ORIGIN = 'https://qoodish.com';

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
