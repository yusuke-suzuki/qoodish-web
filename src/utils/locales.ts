export const LOCALES = ['en', 'ja'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: string | undefined | null): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function toLocale(value: string | undefined | null): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export const LOCALE_COOKIE = 'NEXT_LOCALE';

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Read by the middleware when a URL carries no locale. Safari has no Cookie
// Store, so the string form stays as the fallback.
export function rememberLocale(locale: string): void {
  const value = toLocale(locale);

  if ('cookieStore' in window) {
    window.cookieStore
      .set({
        name: LOCALE_COOKIE,
        value,
        path: '/',
        expires: Date.now() + LOCALE_COOKIE_MAX_AGE * 1000,
        sameSite: 'lax'
      })
      .catch(() => {});
    return;
  }

  // biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is preferred above; this is the fallback for browsers without it.
  document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

export function localePath(locale: string, path = ''): string {
  const normalized = path === '/' ? '' : path;
  return `/${toLocale(locale)}${normalized}`;
}
