import { type Locale, pathLocale, preferredLocale } from './locales.ts';

export function offlinePath(locale: Locale): string {
  return `/offline/${locale}`;
}

export function offlinePathFor(
  requestUrl: string,
  browserLanguages: readonly string[]
): string {
  return offlinePath(
    pathLocale(new URL(requestUrl).pathname) ??
      preferredLocale(browserLanguages.join(','))
  );
}
