import { type Locale, toLocale } from './locales.ts';

export function offlinePath(locale: Locale): string {
  return `/offline/${locale}`;
}

export function offlinePathFor(requestUrl: string): string {
  const [, firstSegment] = new URL(requestUrl).pathname.split('/');
  return offlinePath(toLocale(firstSegment));
}
