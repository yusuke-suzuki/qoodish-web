import type { Locale } from '../i18n/index.ts';

export function formatDateTime(
  value: string,
  locale: Locale,
  timeZone: string
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone,
    timeZoneName: 'short'
  }).format(new Date(value));
}
